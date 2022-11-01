import { APIGatewayEvent } from './api/api-gateway.interface';
import { ProcessPayload } from './database';
import { Responses } from './api';
export declare type LambdaEvent = APIGatewayEvent & ProcessPayload;
export declare type Callback<TResult = any> = (error?: Error | string | null, result?: TResult) => void;
export declare type Handler<TEvent = LambdaEvent, TResponse = Responses> = (event: TEvent, context: object, callback: Callback<TResponse>) => Promise<TResponse> | TResponse;
export declare type ErrorHandler<TError = any, TResponse = Responses> = (error: TError) => Promise<TResponse> | TResponse;
export declare type EnvironmentVariableName = 'STAGE' | 'DEBUG' | 'VERBOSE' | 'INTERNAL' | 'SENSITIVE' | 'REGION' | 'LOCALHOST_PORT' | string;
export declare function getEnvironmentVariable(name: EnvironmentVariableName): string | boolean | number | undefined;
/**
 * @description Checks for the Warm-Up flag and ensures the function is only called if it not a warm-up call. It also handles any unexpect error.
 *
 * ```typescript
 * module.exports.handler = createLambda(async (event) => {
 *  ... Lambda Code ...
 * });
 * ```
 */
export declare function createLambda<TEvent = LambdaEvent, TOutput = Responses>(handler: Handler<TEvent, TOutput>, errorHandler?: ErrorHandler): Handler<TEvent, TOutput | Responses>;
