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
const logger_1 = require("./logger");
const createLambda = (lambdaFunction) => {
    return (event, context, callback) => __awaiter(void 0, void 0, void 0, function* () {
        if (!!event.wu) {
            logger_1.Logger.log('Function Warm Up called! Skipping calling actual function!');
            return { statusCode: 200, body: 'Function warmed up successfully!' };
        }
        return lambdaFunction(event, context, callback);
    });
};
exports.createLambda = createLambda;
