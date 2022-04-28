import {ProcessPayload} from './database/index';
import {Responses} from './api';
import {Logger} from './logger';

export interface LambdaEvent extends ProcessPayload {
  httpMethod: string | 'GET' | 'PUT' | 'POST';
  headers: {
    [key: string]: string;
  };
  queryStringParameters: {
    [key: string]: string;
  };
  body: string;
  pathParameters: {
    [key: string]: string;
  };
}

export interface LambdaContext {
  [key: string]: any;
}

export type LambdaCallback = Function;

interface AnyValue {
  [key: string]: any;
}

export interface LambdaReturn extends AnyValue {
  statusCode: number;
  body: string;
}

type LambdaFunction = (event: LambdaEvent, context?: LambdaContext, callback?: LambdaCallback) => Promise<LambdaReturn>;

/**
 * @description Checks for the Warm-Up flag and ensures the function is only called if it not a warm-up call. It also handles any unexpect error.
 *
 * ```typescript
 * module.exports.handler = createLambda(async (event) => {
 *  ... Lambda Code ...
 * });
 * ```
 */
export const createLambda = (lambdaFunction: LambdaFunction) => {
  Logger.verbose('createLambda');
  return async (event: LambdaEvent, context?: LambdaContext, callback?: LambdaCallback): Promise<LambdaReturn> => {
    Logger.verbose('Checking warm up!');
    if (!!event.wu) {
      Logger.log('Function Warm Up called! Skipping calling actual function!');
      return Responses.success('Function warmed up successfully!');
    }
    try {
      Logger.verbose('Trying to call lambdaFunction and returning it!');
      return lambdaFunction(event, context, callback);
    } catch (error: any) {
      Logger.warning('Lambda function failed without a try/catch wrap! Trying to handle error from createLambda function!');
      Logger.verbose('Checking if error was thrown by AWS!');
      if (error?.$metadata?.httpStatusCode) {
        Logger.verbose('Creating AWS failed appropriate response object!');
        return Responses.error(error.$metadata.httpStatusCode, 'This operation failed unexpectedly!', error);
      }
      Logger.verbose('Creating unknown failed response object!');
      return Responses.internalError('This operation failed unexpectedly!', error);
    }
  };
};
