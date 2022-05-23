"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __exportStar = (this && this.__exportStar) || function(m, exports) {
    for (var p in m) if (p !== "default" && !Object.prototype.hasOwnProperty.call(exports, p)) __createBinding(exports, m, p);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.createLambda = void 0;
const api_1 = require("./api");
const logger_1 = require("./logger");
/**
 * @description Checks for the Warm-Up flag and ensures the function is only called if it not a warm-up call. It also handles any unexpect error.
 *
 * ```typescript
 * module.exports.handler = createLambda(async (event) => {
 *  ... Lambda Code ...
 * });
 * ```
 */
const createLambda = (handler) => {
    logger_1.Logger.internal.verbose('createLambda');
    return (event, context, callback) => {
        var _a;
        logger_1.Logger.internal.verbose('Checking warm up!');
        if ('wu' in event && !!event.wu) {
            logger_1.Logger.log('Function Warm Up called! Skipping calling actual function!');
            return api_1.Responses.success('Function warmed up successfully!');
        }
        try {
            logger_1.Logger.internal.verbose('Trying to call lambdaFunction and returning it!');
            return handler(event, context, callback);
        }
        catch (error) {
            logger_1.Logger.internal.warning('Lambda function failed without a try/catch wrap! Trying to handle error from createLambda function!');
            logger_1.Logger.internal.verbose('Checking if error was thrown by AWS!');
            if ((_a = error === null || error === void 0 ? void 0 : error.$metadata) === null || _a === void 0 ? void 0 : _a.httpStatusCode) {
                logger_1.Logger.internal.verbose('Creating AWS failed appropriate response object!');
                return api_1.Responses.error(error.$metadata.httpStatusCode, 'This operation failed unexpectedly!', error);
            }
            logger_1.Logger.internal.verbose('Creating unknown failed response object!');
            return api_1.Responses.internalError('This operation failed unexpectedly!', error);
        }
    };
};
exports.createLambda = createLambda;
__exportStar(require("./ssm"), exports);
