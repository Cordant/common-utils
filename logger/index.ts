import {StatusCode} from './status-code';

const STAGE: string = process.env.STAGE ?? process.env.stage ?? 'dev';
const DEBUG: boolean = process.env.DEBUG === 'true';
const SENSITIVE: boolean = process.env.SENSITIVE === 'true';
const REGION = process.env.AWS_REGION ?? process.env.AWS_DEFAULT_REGION;

enum LogType {
  log = 'LOG',
  debug = 'DEBUG',
  verbose = 'VERBOSE',
  sensitive = 'SENSITIVE',
  error = 'ERROR',
  warning = 'WARNING',
  deprecated = 'DEPRECATED',
}

/**
 * @description This class is used to standardize message logging, it ensures that all message has a standard format following `[TYPE][FUNCTION_NAME][...OTHER OPTIONS] message with details`
 */
export class Logger {

  /**
   * @description Logs message everytime.
   * @example [LOG][lambda_function_name] message
   */
  static log(message: any): void;
  static log(messageA: any, messageB: any): void;
  static log(messageA: any, messageB: any, messageC: any): void;
  static log(messageA: any, messageB: any, messageC: any, messageD: any): void;
  static log(messageA: any, messageB: any, messageC: any, messageD: any, messageE: any): void;
  static log(...messages: any[]): void {
    Logger.rawLog(LogType.log, messages);
  }

  /**
   * @description Logs message only if the environment variable DEBUG is passed as 'true' or STAGE is 'dev' or 'demo'.
   * @example [DEBUG][lambda_function_name] message
   */
  static debug(message: any): void;
  static debug(messageA: any, messageB: any): void;
  static debug(messageA: any, messageB: any, messageC: any): void;
  static debug(messageA: any, messageB: any, messageC: any, messageD: any): void;
  static debug(messageA: any, messageB: any, messageC: any, messageD: any, messageE: any): void;
  static debug(...messages: any[]): void {
    if (DEBUG || STAGE === 'dev' || STAGE === 'demo') {
      Logger.rawLog(LogType.debug, messages);
    }
  }

  /**
   * @description Logs message only if the environment variable DEBUG is passed as 'true'.
   * @example [VERBOSE][lambda_function_name] message
   */
  static verbose(message: any): void;
  static verbose(messageA: any, messageB: any): void;
  static verbose(messageA: any, messageB: any, messageC: any): void;
  static verbose(messageA: any, messageB: any, messageC: any, messageD: any): void;
  static verbose(messageA: any, messageB: any, messageC: any, messageD: any, messageE: any): void;
  static verbose(...messages: any[]): void {
    if (DEBUG) {
      Logger.rawLog(LogType.verbose, messages);
    }
  }

  /**
   * @description Logs message everytime, but it will only should the `data` if the environment variable SENSITIVE is 'true' or STAGE is 'dev' otherwise it will redact the `data`.
   * @example [SENSITIVE][lambda_function_name] email: <REDACTED>
   */
  static sensitive(type: string, data: any): void {
    const prefix = Logger.messagePrefix(LogType.sensitive);
    if (SENSITIVE || STAGE === 'dev') {
      console.log(prefix, `${type}: ${JSON.stringify(data)}`);
    } else {
      console.log(prefix, `${type}: <REDACTED>`);
    }
  }

  /**
   * @description Logs error message everytime. If you pass only one parameter it will treat it as a user-friendly message that can be display for the user if you pass 2 parameter, it will assume the first parameter is the error code for a standard API response.
   * @example [ERROR][lambda_function_name][500][Internal Error] user-friendly message
   */
  static error(message: any): void;
  static error(statusCode: number, message: any): void
  static error(...args: any[]): void {
    const prefix = Logger.messagePrefix(LogType.error);
    if (args.length > 1) {
      const statusCode = Logger.prefixPart(args[0]);
      const statusCodeMessage = Logger.prefixPart(StatusCode.getMessage(args[0]));
      const message = typeof args[1] === 'string' ? args[1] : JSON.stringify(args[1]);
      console.error(`${prefix}${statusCode}${statusCodeMessage}`, message);
    } else {
      const message = typeof args[0] === 'string' ? args[0] : JSON.stringify(args[0]);
      console.error(prefix, message);
    }
  }

  /**
   * @description Logs error message everytime. This should be called in every AWS Services catch parameter. It gets the httpStatusCode from the error object and
   * @example [ERROR][lambda_function_name][500][Internal Error][AwsErrorCode] {"data": "value"}
   */
  static awsError(data: any): void {
    const prefix = Logger.messagePrefix(LogType.error);
    const statusCode = Logger.prefixPart(data.$metadata.httpStatusCode);
    const statusCodeMessage = Logger.prefixPart(StatusCode.getMessage(data.$metadata.httpStatusCode));
    const awsCode = Logger.prefixPart(data.name);
    console.error(`${prefix}${statusCode}${statusCodeMessage}${awsCode}`, JSON.stringify(data));
  }

  /**
   * @description Logs message everytime. Should be used when a non-breaking error occurred.
   * @example [WARNING][lambda_function_name] user-friendly message.
   */
  static warning(message: any): void;
  static warning(messageA: any, messageB: any): void;
  static warning(messageA: any, messageB: any, messageC: any): void;
  static warning(messageA: any, messageB: any, messageC: any, messageD: any): void;
  static warning(messageA: any, messageB: any, messageC: any, messageD: any, messageE: any): void;
  static warning(...messages: any[]): void {
    Logger.rawLog(LogType.warning, messages);
  }

  /**
   * @description Logs message everytime. Should be used when a deprecation functionality is used and will be removed in the future.
   * @example [DEPRECATED][lambda_function_name] user-friendly message.
   */
  static deprecated(message: any): void;
  static deprecated(messageA: any, messageB: any): void;
  static deprecated(messageA: any, messageB: any, messageC: any): void;
  static deprecated(messageA: any, messageB: any, messageC: any, messageD: any): void;
  static deprecated(messageA: any, messageB: any, messageC: any, messageD: any, messageE: any): void;
  static deprecated(...messages: any): void {
    Logger.rawLog(LogType.deprecated, messages);
  }

  private static rawLog(type: LogType, messages: any[]) {
    const prefix = Logger.messagePrefix(type);
    const mappedMessages = messages.map(x => typeof x === 'string' ? x : JSON.stringify(x));
    console.log(prefix, ...mappedMessages);
  }

  private static messagePrefix(type: LogType): string {
    const typePrefix = Logger.prefixPart(type);
    const functionName = Logger.prefixPart(process.env.AWS_LAMBDA_FUNCTION_NAME);
    return `${typePrefix}${functionName}`;
  }

  private static prefixPart(environmentVariable?: string): string {
    if (environmentVariable) {
      return `[${environmentVariable}]`;
    }
    return '';
  }
}
