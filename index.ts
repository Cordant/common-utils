import {ProcessPayload} from './database/index';
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
  }
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

export const createLambda = (lambdaFunction: LambdaFunction) => {
  return async (event: LambdaEvent, context?: LambdaContext, callback?: LambdaCallback): Promise<LambdaReturn> => {
    if (!!event.wu) {
      Logger.log('Function Warm Up called! Skipping calling actual function!');
      return {statusCode: 200, body: 'Function warmed up successfully!'};
    }
    return lambdaFunction(event, context, callback);
  };
}
