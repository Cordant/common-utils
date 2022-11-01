export declare enum LogType {
    log = "LOG",
    debug = "DEBUG",
    verbose = "VERBOSE",
    sensitive = "SENSITIVE",
    error = "ERROR",
    warning = "WARNING",
    deprecated = "DEPRECATED",
    awsError = "AWS_ERROR"
}
export interface LoggerConfig {
    globalTrace?: boolean;
    logTypesToTrack?: LogType[];
}
/**
 * @description This class is used to standardize message logging, it ensures that all message has a standard format following `[TYPE][FUNCTION_NAME][...OTHER OPTIONS] message with details`
 */
export declare class Logger {
    private static instance;
    private static isSingleton;
    isInternal: boolean;
    type: LogType;
    traces: {
        type: LogType;
        message: string;
    }[];
    private logTypesToTrack;
    static setConfig({ globalTrace, logTypesToTrack }: LoggerConfig): void;
    static getInstance(): Logger;
    /**
     * @description Logs message only if the INTERNAL environment variable is 'true'. You probably shouldn't be using it!
     *
     * ```typescript
     * Logger.internal.log('User-friendly message');
     * Logger.internal.debug('User-friendly message');
     * ```
     *
     */
    static get internal(): Logger;
    /**
     * @description Logs message everytime.
     * @example [LOG][lambda_function_name] message
     */
    static log(message: any): void;
    static log(messageA: any, messageB: any): void;
    static log(messageA: any, messageB: any, messageC: any): void;
    static log(messageA: any, messageB: any, messageC: any, messageD: any): void;
    static log(messageA: any, messageB: any, messageC: any, messageD: any, messageE: any): void;
    /**
     * @description Logs message only if the environment variable DEBUG is passed as 'true' or STAGE is 'dev' or 'demo'.
     * @example [DEBUG][lambda_function_name] message
     */
    static debug(message: any): void;
    static debug(messageA: any, messageB: any): void;
    static debug(messageA: any, messageB: any, messageC: any): void;
    static debug(messageA: any, messageB: any, messageC: any, messageD: any): void;
    static debug(messageA: any, messageB: any, messageC: any, messageD: any, messageE: any): void;
    /**
     * @description Logs message only if the environment variable VERBOSE is passed as 'true'.
     * @example [VERBOSE][lambda_function_name] message
     */
    static verbose(message: any): void;
    static verbose(messageA: any, messageB: any): void;
    static verbose(messageA: any, messageB: any, messageC: any): void;
    static verbose(messageA: any, messageB: any, messageC: any, messageD: any): void;
    static verbose(messageA: any, messageB: any, messageC: any, messageD: any, messageE: any): void;
    /**
     * @description Logs message everytime, but it will only should the `data` if the environment variable SENSITIVE is 'true' or STAGE is 'dev' otherwise it will redact the `data`.
     * @example [SENSITIVE][lambda_function_name] email: <REDACTED>
     */
    static sensitive(type: string, data: any): void;
    /**
     * @description Logs message everytime. Should be used when a non-breaking error occurred.
     * @example [WARNING][lambda_function_name] user-friendly message.
     */
    static warning(message: any): void;
    static warning(messageA: any, messageB: any): void;
    static warning(messageA: any, messageB: any, messageC: any): void;
    static warning(messageA: any, messageB: any, messageC: any, messageD: any): void;
    static warning(messageA: any, messageB: any, messageC: any, messageD: any, messageE: any): void;
    /**
     * @description Logs message everytime. Should be used when a deprecation functionality is used and will be removed in the future.
     * @example [DEPRECATED][lambda_function_name] user-friendly message.
     */
    static deprecated(message: any): void;
    static deprecated(messageA: any, messageB: any): void;
    static deprecated(messageA: any, messageB: any, messageC: any): void;
    static deprecated(messageA: any, messageB: any, messageC: any, messageD: any): void;
    static deprecated(messageA: any, messageB: any, messageC: any, messageD: any, messageE: any): void;
    /**
     * @description Logs error message everytime. If you pass only one parameter it will treat it as a user-friendly message that can be display for the user if you pass 2 parameter, it will assume the first parameter is the error code for a standard API response.
     * @example [ERROR][lambda_function_name][500][Internal Error] user-friendly message
     */
    static error(message: any): void;
    static error(statusCode: number, messageA: any): void;
    static error(statusCode: number, messageA: any, messageB: any): void;
    static error(statusCode: number, messageA: any, messageB: any, messageC: any): void;
    static error(statusCode: number, messageA: any, messageB: any, messageC: any, messageD: any): void;
    static error(statusCode: number, messageA: any, messageB: any, messageC: any, messageD: any, messageE: any): void;
    /**
     * @description Logs error message everytime. This should be called in every AWS Services catch parameter. It gets the httpStatusCode from the error object and
     * @example [ERROR][lambda_function_name][500][Internal Error][AwsErrorCode] {"data": "value"}
     */
    static awsError(data: any): void;
    static logTrace(): void;
    static resetTrace(): void;
    /**
     * @description Logs message everytime.
     * @example [LOG][lambda_function_name] message
     */
    log(...messages: any[]): void;
    /**
     * @description Logs message only if STAGE is 'dev' or 'demo' or if the environment variable DEBUG is passed as 'true' in 'prod'.
     * @example [DEBUG][lambda_function_name] message
     */
    debug(...messages: any[]): void;
    /**
     * @description Logs message only if the environment variable VERBOSE is passed as 'true'.
     * @example [VERBOSE][lambda_function_name] message
     */
    verbose(...messages: any[]): void;
    /**
     * @description Logs message everytime, but it will only should the `data` if the environment variable SENSITIVE is 'true' or STAGE is 'dev' otherwise it will redact the `data`.
     * @example [SENSITIVE][lambda_function_name] email: <REDACTED>
     */
    sensitive(type: string, data: any): void;
    /**
     * @description Logs message everytime. Should be used when a non-breaking error occurred.
     * @example [WARNING][lambda_function_name] user-friendly message.
     */
    warning(...messages: any[]): void;
    /**
     * @description Logs message everytime. Should be used when a deprecation functionality is used and will be removed in the future.
     * @example [DEPRECATED][lambda_function_name] user-friendly message.
     */
    deprecated(...messages: any): void;
    /**
     * @description Logs error message everytime. If you pass only one parameter it will treat it as a user-friendly message that can be display for the user if you pass 2 parameter, it will assume the first parameter is the error code for a standard API response.
     * @example [ERROR][lambda_function_name][500][Internal Error] user-friendly message
     */
    error(...args: any[]): void;
    /**
     * @description Logs error message everytime. This should be called in every AWS Services catch parameter. It gets the httpStatusCode from the error object and
     * @example [ERROR][lambda_function_name][500][Internal Error][AwsErrorCode] {"data": "value"}
     */
    awsError(data: any): void;
    logTrace(): void;
    resetTrace(): void;
    private prefixPart;
    private getLogMessage;
    private buildMessage;
    private stringifyMessages;
    private get shouldLogIfInternal();
    private get shouldLog();
    get prefix(): string;
}
