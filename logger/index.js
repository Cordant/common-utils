"use strict";
var _a, _b, _c, _d;
Object.defineProperty(exports, "__esModule", { value: true });
exports.Logger = void 0;
const status_code_1 = require("../logger/status-code");
const STAGE = (_b = (_a = process.env.STAGE) !== null && _a !== void 0 ? _a : process.env.stage) !== null && _b !== void 0 ? _b : 'dev';
let DEBUG = false;
if ((_c = process.env) === null || _c === void 0 ? void 0 : _c.DEBUG) {
    if (typeof process.env.DEBUG === 'string') {
        DEBUG = process.env.DEBUG === 'true';
    }
    if (typeof process.env.DEBUG === 'boolean') {
        DEBUG = process.env.DEBUG;
    }
}
const REGION = (_d = process.env.AWS_REGION) !== null && _d !== void 0 ? _d : process.env.AWS_DEFAULT_REGION;
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
class Logger {
    static log(...args) {
        const prefix = Logger.messagePrefix(LogType.log);
        const message = args.map(x => typeof x === 'string' ? x : JSON.stringify(x)).join(' ');
        console.log(prefix, message);
    }
    static debug(...args) {
        if (DEBUG || STAGE === 'dev' || STAGE === 'demo') {
            const prefix = Logger.messagePrefix(LogType.debug);
            const message = args.map(x => typeof x === 'string' ? x : JSON.stringify(x)).join(' ');
            console.log(prefix, message);
        }
    }
    static verbose(...args) {
        if (DEBUG) {
            const prefix = Logger.messagePrefix(LogType.verbose);
            const message = args.map(x => typeof x === 'string' ? x : JSON.stringify(x)).join(' ');
            console.log(prefix, message);
        }
    }
    static sensitive(type, data) {
        const prefix = Logger.messagePrefix(LogType.sensitive);
        if (DEBUG || STAGE === 'dev') {
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
    static awsError(data) {
        const prefix = Logger.messagePrefix(LogType.error);
        const statusCode = Logger.prefixPart(data.$metadata.httpStatusCode);
        const statusCodeMessage = Logger.prefixPart(status_code_1.StatusCode.getMessage(data.$metadata.httpStatusCode));
        const awsCode = Logger.prefixPart(data.name);
        console.error(`${prefix}${statusCode}${statusCodeMessage}${awsCode}`, JSON.stringify(data));
    }
    static warning(...args) {
        const prefix = Logger.messagePrefix(LogType.warning);
        const message = args.map(x => typeof x === 'string' ? x : JSON.stringify(x)).join(' ');
        console.log(prefix, message);
    }
    static deprecated(message) {
        const prefix = Logger.messagePrefix(LogType.error);
        console.log(prefix, message);
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
