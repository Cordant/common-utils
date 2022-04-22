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
exports.Database = void 0;
const database_1 = require("../database");
const responses_1 = require("./responses");
const logger_1 = require("../logger");
const payload_1 = require("./payload");
class Database {
    static process(event, functionName, fieldsToPass, successMessage, errorMessage, options) {
        return __awaiter(this, void 0, void 0, function* () {
            logger_1.Logger.verbose('APIDatabase.process');
            try {
                logger_1.Logger.verbose('Mapping lambda event to payload!');
                const payload = payload_1.Payload.fromMethod(event);
                logger_1.Logger.debug(payload);
                logger_1.Logger.verbose('Calling InternalDatabase.process!');
                const data = yield database_1.Database.process(payload, functionName, fieldsToPass, options);
                logger_1.Logger.verbose('Creating appropriate success response object!');
                return responses_1.Responses.success(successMessage, data);
            }
            catch (e) {
                logger_1.Logger.verbose('Creating appropriate failed response object!');
                return Database.handleError(e, errorMessage);
            }
        });
    }
    static processReadOnly(event, functionName, fieldsToPass, successMessage, errorMessage, options) {
        return __awaiter(this, void 0, void 0, function* () {
            logger_1.Logger.verbose('APIDatabase.processReadOnly');
            try {
                logger_1.Logger.verbose('Mapping lambda event to payload!');
                const payload = payload_1.Payload.fromMethod(event);
                logger_1.Logger.debug(payload);
                logger_1.Logger.verbose('Calling InternalDatabase.processReadOnly!');
                const data = yield database_1.Database.processReadOnly(payload, functionName, fieldsToPass, options);
                logger_1.Logger.verbose('Creating appropriate success response object!');
                return responses_1.Responses.success(successMessage, data);
            }
            catch (e) {
                logger_1.Logger.verbose('Creating appropriate failed response object!');
                return Database.handleError(e, errorMessage);
            }
        });
    }
    static handleError(error, errorMessage) {
        var _a;
        logger_1.Logger.verbose('APIDatabase.handleError');
        logger_1.Logger.verbose('Checking if error was thrown by AWS!');
        if ((_a = error === null || error === void 0 ? void 0 : error.$metadata) === null || _a === void 0 ? void 0 : _a.httpStatusCode) {
            logger_1.Logger.verbose('Creating AWS failed appropriate response object!');
            return responses_1.Responses.error(error.$metadata.httpStatusCode, errorMessage, error);
        }
        logger_1.Logger.verbose('Creating unknown failed response object!');
        return responses_1.Responses.internalError(errorMessage, error);
    }
}
exports.Database = Database;
__exportStar(require("./responses"), exports);
__exportStar(require("./payload"), exports);
