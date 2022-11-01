"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.createLambda = exports.getEnvironmentVariable = void 0;
const api_1 = require("./api");
const logger_1 = require("./logger");
function getEnvironmentVariable(name) {
    var _a, _b, _c, _d, _e, _f, _g;
    switch (name) {
        case 'STAGE':
            return (_b = (_a = process.env.STAGE) !== null && _a !== void 0 ? _a : process.env.stage) !== null && _b !== void 0 ? _b : 'dev';
        case 'DEBUG':
            return process.env.DEBUG === 'true' || process.env.debug === 'true';
        case 'VERBOSE':
            return process.env.VERBOSE === 'true' || process.env.verbose === 'true';
        case 'INTERNAL':
            return process.env.INTERNAL === 'true' || process.env.internal === 'true';
        case 'SENSITIVE':
            return process.env.SENSITIVE === 'true' || process.env.sensitive === 'true';
        case 'REGION':
            const region = (_e = (_d = (_c = process.env.AWS_REGION) !== null && _c !== void 0 ? _c : process.env.AWS_DEFAULT_REGION) !== null && _d !== void 0 ? _d : process.env.REGION) !== null && _e !== void 0 ? _e : process.env.region;
            if (!region) {
                logger_1.Logger.internal.error(`No region found in environment variables!`);
                throw new Error(`No region found in environment variables!`);
            }
            return region;
        case 'LOCALHOST_PORT':
            return +((_g = (_f = process.env.LOCALHOST_PORT) !== null && _f !== void 0 ? _f : process.env.localhost_port) !== null && _g !== void 0 ? _g : '') || 8100;
        default:
            return process.env[name];
    }
}
exports.getEnvironmentVariable = getEnvironmentVariable;
/**
 * @description Checks for the Warm-Up flag and ensures the function is only called if it not a warm-up call. It also handles any unexpect error.
 *
 * ```typescript
 * module.exports.handler = createLambda(async (event) => {
 *  ... Lambda Code ...
 * });
 * ```
 */
function createLambda(handler, errorHandler) {
    logger_1.Logger.internal.verbose('createLambda');
    return (event, context, callback) => __awaiter(this, void 0, void 0, function* () {
        var _a;
        logger_1.Logger.internal.verbose('Checking warm up!');
        if ('wu' in event && event.wu) {
            logger_1.Logger.log('Function Warm Up called! Skipping calling actual function!');
            return api_1.Responses.success('Function warmed up successfully!');
        }
        logger_1.Logger.internal.verbose('Calling handler and returning it!');
        let hasError = false;
        try {
            logger_1.Logger.resetTrace();
            logger_1.Logger.log('START');
            return yield handler(event, context, callback);
        }
        catch (error) {
            logger_1.Logger.internal.verbose('An error occurred when calling handler!');
            if (errorHandler) {
                logger_1.Logger.internal.verbose('Handling error using errorHandler callback!');
                try {
                    return yield errorHandler(error);
                }
                catch (err) {
                    hasError = true;
                    logger_1.Logger.internal.warning('Trying to call errorHandler failed! Returning a generic error!');
                    logger_1.Logger.internal.error(err);
                    return api_1.Responses.internalError('An unexpected error occurred!', error);
                }
            }
            hasError = true;
            logger_1.Logger.internal.warning('No errorHandler was passed, generating default error response!');
            logger_1.Logger.internal.verbose('Checking if error was thrown by AWS!');
            if ((_a = error === null || error === void 0 ? void 0 : error.$metadata) === null || _a === void 0 ? void 0 : _a.httpStatusCode) {
                logger_1.Logger.internal.verbose('Creating AWS failed appropriate response object!');
                return api_1.Responses.error(error.$metadata.httpStatusCode, 'This operation failed unexpectedly!', error);
            }
            logger_1.Logger.internal.verbose('Creating unknown failed response object!');
            return api_1.Responses.internalError('This operation failed unexpectedly!', error);
        }
        finally {
            logger_1.Logger.log('END');
            if (hasError && logger_1.Logger.getInstance().shouldTraceGlobally) {
                logger_1.Logger.logTrace();
            }
        }
    });
}
exports.createLambda = createLambda;
;
