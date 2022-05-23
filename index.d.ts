import { ProcessPayload } from './database';
import { Responses } from './api';
import { Handler, APIGatewayProxyEvent } from 'aws-lambda';
export declare type LambdaEvent = APIGatewayProxyEvent & ProcessPayload;
/**
 * @description Checks for the Warm-Up flag and ensures the function is only called if it not a warm-up call. It also handles any unexpect error.
 *
 * ```typescript
 * module.exports.handler = createLambda(async (event) => {
 *  ... Lambda Code ...
 * });
 * ```
 */
export declare const createLambda: <TEvent = LambdaEvent, TOutput = Responses>(handler: Handler<TEvent, TOutput>) => Responses | Handler<TEvent, TOutput>;
export * from './ssm';
