/**
 * @description This class is used to standardize message logging, it ensures that all message has a standard format following `[TYPE][FUNCTION_NAME][...OTHER OPTIONS] message with details`
 */
export declare class Logger {
    private static isInternal;
    /**
     * @description Logs message only if the INTERNAL environment variable is 'true'. You probably shouldn't be using it!
     *
     * ```typescript
     * Logger.internal.log('User-friendly message');
     * Logger.internal.debug('User-friendly message');
     * ```
     *
     */
    static get internal(): typeof Logger;
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
    static error(statusCode: number, message: any): void;
    /**
     * @description Logs error message everytime. This should be called in every AWS Services catch parameter. It gets the httpStatusCode from the error object and
     * @example [ERROR][lambda_function_name][500][Internal Error][AwsErrorCode] {"data": "value"}
     */
    static awsError(data: any): void;
    private static rawLog;
    private static messagePrefix;
    private static prefixPart;
}
