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
const createLambda = (lambdaFunction) => {
    logger_1.Logger.verbose('createLambda');
    return (event, context, callback) => __awaiter(void 0, void 0, void 0, function* () {
        var _a;
        logger_1.Logger.verbose('Checking warm up!');
        if (!!event.wu) {
            logger_1.Logger.log('Function Warm Up called! Skipping calling actual function!');
            return api_1.Responses.success('Function warmed up successfully!');
        }
        try {
            logger_1.Logger.verbose('Trying to call lambdaFunction and returning it!');
            return lambdaFunction(event, context, callback);
        }
        catch (error) {
            logger_1.Logger.warning('Lambda function failed without a try/catch wrap! Trying to handle error from createLambda function!');
            logger_1.Logger.verbose('Checking if error was thrown by AWS!');
            if ((_a = error === null || error === void 0 ? void 0 : error.$metadata) === null || _a === void 0 ? void 0 : _a.httpStatusCode) {
                logger_1.Logger.verbose('Creating AWS failed appropriate response object!');
                return api_1.Responses.error(error.$metadata.httpStatusCode, 'This operation failed unexpectedly!', error);
            }
            logger_1.Logger.verbose('Creating unknown failed response object!');
            return api_1.Responses.internalError('This operation failed unexpectedly!', error);
        }
    });
};
exports.createLambda = createLambda;
