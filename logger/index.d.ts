export declare class Logger {
    static log(message: any): void;
    static log(messageA: any, messageB: any): void;
    static log(messageA: any, messageB: any, messageC: any): void;
    static debug(message: any): void;
    static debug(messageA: any, messageB: any): void;
    static debug(messageA: any, messageB: any, messageC: any): void;
    static verbose(message: any): void;
    static verbose(messageA: any, messageB: any): void;
    static verbose(messageA: any, messageB: any, messageC: any): void;
    static sensitive(type: string, data: any): void;
    static error(message: any): void;
    static error(statusCode: number, message: any): void;
    static awsError(data: any): void;
    static warning(message: any): void;
    static warning(messageA: any, messageB: any): void;
    static warning(messageA: any, messageB: any, messageC: any): void;
    static deprecated(message: string): void;
    private static messagePrefix;
    private static prefixPart;
}
