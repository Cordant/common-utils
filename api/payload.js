"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Payload = void 0;
const logger_1 = require("../logger");
class Payload {
    static fromMethod(event) {
        logger_1.Logger.verbose('Payload.fromMethod');
        logger_1.Logger.verbose('Determining payload from httpMethod!');
        logger_1.Logger.debug('Mapping payload for method:', event.httpMethod);
        switch (event.httpMethod) {
            case 'PUT':
            case 'POST':
                return Object.assign(Object.assign({}, Payload.fromPath(event)), Payload.fromBody(event));
            case 'DELETE':
            case 'GET':
            case 'HEAD':
                return Object.assign(Object.assign({}, Payload.fromPath(event)), Payload.fromQueryParams(event));
            default:
                return Object.assign(Object.assign(Object.assign({}, Payload.fromPath(event)), Payload.fromQueryParams(event)), Payload.fromBody(event));
        }
    }
    static fromBody(event) {
        logger_1.Logger.verbose('Payload.fromBody');
        logger_1.Logger.verbose('Checking event.body for nulls!');
        if (!event.body) {
            logger_1.Logger.verbose('event.body is null, returning empty object!');
            return {};
        }
        logger_1.Logger.verbose('Parsing data and returning values!');
        return JSON.parse(event.body);
    }
    static fromPath(event) {
        logger_1.Logger.verbose('Payload.fromPathParams');
        return Payload.determineTypes(event.pathParameters);
    }
    static fromQueryParams(event) {
        logger_1.Logger.verbose('Payload.fromQueryParams');
        return Payload.determineTypes(event.queryStringParameters);
    }
    static determineTypes(payload) {
        logger_1.Logger.verbose('Payload.determineTypes');
        logger_1.Logger.verbose('Checking payload for nulls');
        if (!payload) {
            logger_1.Logger.verbose('Payload is null returning empty object!');
            return {};
        }
        logger_1.Logger.verbose('Creating object to add the data');
        const result = {};
        logger_1.Logger.verbose('Adding data to object');
        for (const key in payload) {
            if (payload.hasOwnProperty(key)) {
                logger_1.Logger.verbose('Adding new data!');
                result[key] = Payload.determineType(payload[key]);
            }
        }
        logger_1.Logger.verbose('Returning mapped data!');
        return result;
    }
    static determineType(value) {
        logger_1.Logger.verbose('Payload.determineType');
        logger_1.Logger.verbose('Checking null');
        if (value === 'null') {
            return null;
        }
        logger_1.Logger.verbose('Checking undefined');
        if (value === 'undefined') {
            return undefined;
        }
        try {
            logger_1.Logger.verbose('Trying to parse!');
            return JSON.parse(value);
        }
        catch (e) {
            logger_1.Logger.verbose('Failed to parse, returning as a string!');
            return value;
        }
    }
}
exports.Payload = Payload;
