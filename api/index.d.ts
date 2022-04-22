import { ProcessOptions as InternalProcessOptions } from '../database';
import { LambdaEvent } from '../index';
export interface ProcessOptions extends InternalProcessOptions {
}
export declare class Database {
    static process(event: LambdaEvent, functionName: string, fieldsToPass: string[], successMessage: string, errorMessage: string, options?: ProcessOptions): Promise<import("./responses").Response>;
    static processReadOnly(event: LambdaEvent, functionName: string, fieldsToPass: string[], successMessage: string, errorMessage: string, options: ProcessOptions): Promise<import("./responses").Response>;
    private static handleError;
}
export * from './responses';
export * from './payload';
