import {StatusCode} from '../logger/status-code';

const STAGE: string = process.env.STAGE ?? process.env.stage ?? 'dev';
let DEBUG: boolean = false;
if (process.env?.DEBUG) {
  if (typeof process.env.DEBUG === 'string') {
    DEBUG = process.env.DEBUG === 'true';
  }
  if (typeof process.env.DEBUG === 'boolean') {
    DEBUG = process.env.DEBUG;
  }
}
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

export class Logger {

  static log(message: any): void;
  static log(messageA: any, messageB: any): void;
  static log(messageA: any, messageB: any, messageC: any): void;
  static log(...args: any[]): void {
    const prefix = Logger.messagePrefix(LogType.log);
    const message = args.map(x => typeof x === 'string' ? x : JSON.stringify(x)).join(' ');
    console.log(prefix, message);
  }

  static debug(message: any): void;
  static debug(messageA: any, messageB: any): void;
  static debug(messageA: any, messageB: any, messageC: any): void;
  static debug(...args: any[]): void {
    if (DEBUG || STAGE === 'dev' || STAGE === 'demo') {
      const prefix = Logger.messagePrefix(LogType.debug);
      const message = args.map(x => typeof x === 'string' ? x : JSON.stringify(x)).join(' ');
      console.log(prefix, message);
    }
  }

  static verbose(message: any): void;
  static verbose(messageA: any, messageB: any): void;
  static verbose(messageA: any, messageB: any, messageC: any): void;
  static verbose(...args: any[]): void {
    if (DEBUG) {
      const prefix = Logger.messagePrefix(LogType.verbose);
      const message = args.map(x => typeof x === 'string' ? x : JSON.stringify(x)).join(' ');
      console.log(prefix, message);
    }
  }

  static sensitive(type: string, data: any): void {
    const prefix = Logger.messagePrefix(LogType.sensitive);
    if (DEBUG || STAGE === 'dev') {
      console.log(prefix, `${type}: ${JSON.stringify(data)}`);
    } else {
      console.log(prefix, `${type}: <REDACTED>`);
    }
  }

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

  static awsError(data: any): void {
    const prefix = Logger.messagePrefix(LogType.error);
    const statusCode = Logger.prefixPart(data.$metadata.httpStatusCode);
    const statusCodeMessage = Logger.prefixPart(StatusCode.getMessage(data.$metadata.httpStatusCode));
    const awsCode = Logger.prefixPart(data.name);
    console.error(`${prefix}${statusCode}${statusCodeMessage}${awsCode}`, JSON.stringify(data));
  }

  static warning(message: any): void;
  static warning(messageA: any, messageB: any): void;
  static warning(messageA: any, messageB: any, messageC: any): void;
  static warning(...args: any[]): void {
    const prefix = Logger.messagePrefix(LogType.warning);
    const message = args.map(x => typeof x === 'string' ? x : JSON.stringify(x)).join(' ');
    console.log(prefix, message);
  }

  static deprecated(message: string): void {
    const prefix = Logger.messagePrefix(LogType.error);
    console.log(prefix, message);
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
