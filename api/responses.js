"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Responses = void 0;
const index_1 = require("../index");
const logger_1 = require("../logger");
class Responses {
    constructor(statusCode, message, data, headers) {
        this.headers = {};
        logger_1.Logger.internal.verbose('Responses.constructor');
        logger_1.Logger.internal.verbose('Assigning values to class properties!');
        this.statusCode = statusCode;
        if (data) {
            logger_1.Logger.internal.verbose('Adding data parameter to body!');
            this.body = JSON.stringify({
                message,
                data,
            });
        }
        else {
            this.body = JSON.stringify({ message });
        }
        if (headers) {
            this.headers = headers;
        }
    }
    /**
     * @description The request succeeded. The result meaning of "success" depends on the HTTP method:
     *
     * - GET: The resource has been fetched and transmitted in the message body.
     * - HEAD: The representation headers are included in the response without any message body.
     * - PUT or POST: The resource describing the result of the action is transmitted in the message body.
     * - TRACE: The message body contains the request message as received by the server.
     */
    static success(message, data, headers) {
        logger_1.Logger.internal.verbose('Responses.success');
        const result = new Responses(200, message, data, headers);
        logger_1.Logger.internal.debug(result);
        return result;
    }
    /**
     * @description The server has encountered a situation it does not know how to handle.
     */
    static internalError(message, data, headers) {
        logger_1.Logger.internal.verbose('Responses.internalError');
        return Responses.error(500, message, data, headers);
    }
    /**
     * @description The request method is not supported by the server and cannot be handled. The only methods that servers are required to support (and therefore that must not return this code) are GET and HEAD.
     */
    static notImplemented(message, data, headers) {
        logger_1.Logger.internal.verbose('Responses.notImplemented');
        return Responses.error(501, message, data, headers);
    }
    /**
     * @description The server cannot or will not process the request due to something that is perceived to be a client error (e.g., malformed request syntax, invalid request message framing, or deceptive request routing).
     */
    static badRequest(message, data, headers) {
        logger_1.Logger.internal.verbose('Responses.badRequest');
        return Responses.error(400, message, data, headers);
    }
    /**
     * @description Although the HTTP standard specifies "unauthorized", semantically this response means "unauthenticated". That is, the client must authenticate itself to get the requested response.
     */
    static unauthorized(message, data, headers) {
        logger_1.Logger.internal.verbose('Responses.unauthorized');
        return Responses.error(401, message, data, headers);
    }
    /**
     * @description The client does not have access rights to the content; that is, it is unauthorized, so the server is refusing to give the requested resource. Unlike 401 Unauthorized, the client's identity is known to the server.
     */
    static forbidden(message, data, headers) {
        logger_1.Logger.internal.verbose('Responses.forbidden');
        return Responses.error(403, message, data, headers);
    }
    /**
     * @description The server can not find the requested resource. In the browser, this means the URL is not recognized. In an API, this can also mean that the endpoint is valid but the resource itself does not exist. Servers may also send this response instead of 403 Forbidden to hide the existence of a resource from an unauthorized client. This response code is probably the most well known due to its frequent occurrence on the web.
     */
    static notFound(message, data, headers) {
        logger_1.Logger.internal.verbose('Responses.notFound');
        return Responses.error(404, message, data, headers);
    }
    /**
     * @description The request method is known by the server but is not supported by the target resource. For example, an API may not allow calling DELETE to remove a resource.
     */
    static methodNotAllowed(message, data, headers) {
        logger_1.Logger.internal.verbose('Responses.methodNotAllowed');
        return Responses.error(405, message, data, headers);
    }
    /**
     * @description This method returns a standard API error message based on `statusCode`. It is also the base method for all the other error methods.
     */
    static error(statusCode, message, data, headers) {
        logger_1.Logger.internal.verbose('Responses.error');
        const response = new Responses(statusCode, message, data, headers);
        logger_1.Logger.internal.error(statusCode, response);
        return response;
    }
    setCorsHeaders(event, allowedOrigins, allowedMethods) {
        var _a;
        logger_1.Logger.internal.verbose('Responses.getHeadersWithCors');
        if (!((_a = event === null || event === void 0 ? void 0 : event.headers) === null || _a === void 0 ? void 0 : _a.origin)) {
            throw new Error('Event is missing headers.origin!');
        }
        logger_1.Logger.internal.verbose('Setting default cors parameters!');
        this.headers['Access-Control-Allow-Headers'] = 'Content-Type,X-Amz-Date,Authorization,X-Api-Key,X-Amz-Security-Token,X-Amz-User-Agent';
        this.headers['Access-Control-Allow-Methods'] = allowedMethods.join(',');
        logger_1.Logger.internal.verbose('Setting allowed origin!');
        const origin = event.headers.origin;
        if (allowedOrigins.includes(origin)) {
            logger_1.Logger.internal.verbose('Request is from an allowed origin!');
            this.headers['Access-Control-Allow-Origin'] = origin;
        }
        else if ((0, index_1.getEnvironmentVariable)('STAGE') === 'dev') {
            logger_1.Logger.internal.verbose(`Current STAGE is dev setting origin to localhost with port ${(0, index_1.getEnvironmentVariable)('LOCALHOST_PORT')}`);
            this.headers['Access-Control-Allow-Origin'] = `http://localhost:${(0, index_1.getEnvironmentVariable)('LOCALHOST_PORT')}`;
        }
        return this;
    }
}
exports.Responses = Responses;
