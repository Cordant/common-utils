"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Responses = void 0;
const index_1 = require("../logger/index");
class Responses {
    /**
     * @description The request succeeded. The result meaning of "success" depends on the HTTP method:
     *
     * - GET: The resource has been fetched and transmitted in the message body.
     * - HEAD: The representation headers are included in the response without any message body.
     * - PUT or POST: The resource describing the result of the action is transmitted in the message body.
     * - TRACE: The message body contains the request message as received by the server.
     *
     * @param message
     * @param data
     */
    static success(message, data) {
        index_1.Logger.verbose('Responses.success');
        const result = {
            statusCode: 200,
            body: JSON.stringify({
                message,
                data,
            }),
        };
        index_1.Logger.debug(result);
        return result;
    }
    /**
     * @description The server has encountered a situation it does not know how to handle.
     *
     * @param message
     * @param data
     */
    static internalError(message, data) {
        index_1.Logger.verbose('Responses.internalError');
        return Responses.error(500, message, data);
    }
    /**
     * @description The request method is not supported by the server and cannot be handled. The only methods that servers are required to support (and therefore that must not return this code) are GET and HEAD.
     *
     * @param message
     */
    static notImplemented(message) {
        index_1.Logger.verbose('Responses.notImplemented');
        return Responses.error(501, message);
    }
    /**
     * @description The server cannot or will not process the request due to something that is perceived to be a client error (e.g., malformed request syntax, invalid request message framing, or deceptive request routing).
     * @param message
     */
    static badRequest(message) {
        index_1.Logger.verbose('Responses.badRequest');
        return Responses.error(400, message);
    }
    /**
     * @description Although the HTTP standard specifies "unauthorized", semantically this response means "unauthenticated". That is, the client must authenticate itself to get the requested response.
     * @param message
     */
    static unauthorized(message) {
        index_1.Logger.verbose('Responses.unauthorized');
        return Responses.error(401, message);
    }
    /**
     * @description The client does not have access rights to the content; that is, it is unauthorized, so the server is refusing to give the requested resource. Unlike 401 Unauthorized, the client's identity is known to the server.
     * @param message
     */
    static forbidden(message) {
        index_1.Logger.verbose('Responses.forbidden');
        return Responses.error(403, message);
    }
    /**
     * @description The server can not find the requested resource. In the browser, this means the URL is not recognized. In an API, this can also mean that the endpoint is valid but the resource itself does not exist. Servers may also send this response instead of 403 Forbidden to hide the existence of a resource from an unauthorized client. This response code is probably the most well known due to its frequent occurrence on the web.
     * @param message
     */
    static notFound(message) {
        index_1.Logger.verbose('Responses.notFound');
        return Responses.error(404, message);
    }
    /**
     * @description The request method is known by the server but is not supported by the target resource. For example, an API may not allow calling DELETE to remove a resource.
     * @param message
     */
    static methodNotAllowed(message) {
        index_1.Logger.verbose('Responses.methodNotAllowed');
        return Responses.error(405, message);
    }
    static error(statusCode, message, data) {
        index_1.Logger.verbose('Responses.error');
        const result = {
            statusCode: statusCode,
            body: JSON.stringify({
                message,
                data,
            }),
        };
        index_1.Logger.error(statusCode, result);
        return result;
    }
}
exports.Responses = Responses;
