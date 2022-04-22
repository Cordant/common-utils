import { ProcessPayload } from './database/index';
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
export declare type LambdaCallback = Function;
interface AnyValue {
    [key: string]: any;
}
export interface LambdaReturn extends AnyValue {
    statusCode: number;
    body: string;
}
declare type LambdaFunction = (event: LambdaEvent, context?: LambdaContext, callback?: LambdaCallback) => Promise<LambdaReturn>;
export declare const createLambda: (lambdaFunction: LambdaFunction) => (event: LambdaEvent, context?: LambdaContext | undefined, callback?: Function | undefined) => Promise<LambdaReturn>;
export {};
