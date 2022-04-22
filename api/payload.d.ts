import { LambdaEvent } from '../index';
import { ProcessPayload } from '../database';
export declare class Payload {
    static fromMethod(event: LambdaEvent): ProcessPayload;
    static fromBody(event: LambdaEvent): ProcessPayload;
    static fromPath(event: LambdaEvent): ProcessPayload;
    static fromQueryParams(event: LambdaEvent): ProcessPayload;
    private static determineTypes;
    private static determineType;
}
