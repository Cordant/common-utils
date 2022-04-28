"use strict";
var _a, _b, _c;
Object.defineProperty(exports, "__esModule", { value: true });
exports.Logger = void 0;
const status_code_1 = require("./status-code");
const STAGE = (_b = (_a = process.env.STAGE) !== null && _a !== void 0 ? _a : process.env.stage) !== null && _b !== void 0 ? _b : 'dev';
const DEBUG = process.env.DEBUG === 'true';
const SENSITIVE = process.env.SENSITIVE === 'true';
const REGION = (_c = process.env.AWS_REGION) !== null && _c !== void 0 ? _c : process.env.AWS_DEFAULT_REGION;
var LogType;
(function (LogType) {
    LogType["log"] = "LOG";
    LogType["debug"] = "DEBUG";
    LogType["verbose"] = "VERBOSE";
    LogType["sensitive"] = "SENSITIVE";
    LogType["error"] = "ERROR";
    LogType["warning"] = "WARNING";
    LogType["deprecated"] = "DEPRECATED";
})(LogType || (LogType = {}));
/**
 * @description This class is used to standardize message logging, it ensures that all message has a standard format following `[TYPE][FUNCTION_NAME][...OTHER OPTIONS] message with details`
 */
class Logger {
    static log(...messages) {
        Logger.rawLog(LogType.log, messages);
    }
    static debug(...messages) {
        if (DEBUG || STAGE === 'dev' || STAGE === 'demo') {
            Logger.rawLog(LogType.debug, messages);
        }
    }
    static verbose(...messages) {
        if (DEBUG) {
            Logger.rawLog(LogType.verbose, messages);
        }
    }
    /**
     * @description Logs message everytime, but it will only should the `data` if the environment variable SENSITIVE is 'true' or STAGE is 'dev' otherwise it will redact the `data`.
     * @example [SENSITIVE][lambda_function_name] email: <REDACTED>
     */
    static sensitive(type, data) {
        const prefix = Logger.messagePrefix(LogType.sensitive);
        if (SENSITIVE || STAGE === 'dev') {
            console.log(prefix, `${type}: ${JSON.stringify(data)}`);
        }
        else {
            console.log(prefix, `${type}: <REDACTED>`);
        }
    }
    static error(...args) {
        const prefix = Logger.messagePrefix(LogType.error);
        if (args.length > 1) {
            const statusCode = Logger.prefixPart(args[0]);
            const statusCodeMessage = Logger.prefixPart(status_code_1.StatusCode.getMessage(args[0]));
            const message = typeof args[1] === 'string' ? args[1] : JSON.stringify(args[1]);
            console.error(`${prefix}${statusCode}${statusCodeMessage}`, message);
        }
        else {
            const message = typeof args[0] === 'string' ? args[0] : JSON.stringify(args[0]);
            console.error(prefix, message);
        }
    }
    /**
     * @description Logs error message everytime. This should be called in every AWS Services catch parameter. It gets the httpStatusCode from the error object and
     * @example [ERROR][lambda_function_name][500][Internal Error][AwsErrorCode] {"data": "value"}
     */
    static awsError(data) {
        const prefix = Logger.messagePrefix(LogType.error);
        const statusCode = Logger.prefixPart(data.$metadata.httpStatusCode);
        const statusCodeMessage = Logger.prefixPart(status_code_1.StatusCode.getMessage(data.$metadata.httpStatusCode));
        const awsCode = Logger.prefixPart(data.name);
        console.error(`${prefix}${statusCode}${statusCodeMessage}${awsCode}`, JSON.stringify(data));
    }
    static warning(...messages) {
        Logger.rawLog(LogType.warning, messages);
    }
    static deprecated(...messages) {
        Logger.rawLog(LogType.deprecated, messages);
    }
    static rawLog(type, messages) {
        const prefix = Logger.messagePrefix(type);
        const mappedMessages = messages.map(x => typeof x === 'string' ? x : JSON.stringify(x));
        console.log(prefix, ...mappedMessages);
    }
    static messagePrefix(type) {
        const typePrefix = Logger.prefixPart(type);
        const functionName = Logger.prefixPart(process.env.AWS_LAMBDA_FUNCTION_NAME);
        return `${typePrefix}${functionName}`;
    }
    static prefixPart(environmentVariable) {
        if (environmentVariable) {
            return `[${environmentVariable}]`;
        }
        return '';
    }
}
exports.Logger = Logger;
