import {Logger} from '../logger/index';

export interface Response {
  statusCode: number,
  body: string,
}

export class Responses {
  /**
   * @description The request succeeded. The result meaning of "success" depends on the HTTP method:
   *
   * - GET: The resource has been fetched and transmitted in the message body.
   * - HEAD: The representation headers are included in the response without any message body.
   * - PUT or POST: The resource describing the result of the action is transmitted in the message body.
   * - TRACE: The message body contains the request message as received by the server.
   */
  static success(message: string, data?: any): Response {
    Logger.verbose('Responses.success');
    const result = Responses.response(200, message, data);
    Logger.debug(result);
    return result;
  }

  /**
   * @description The server has encountered a situation it does not know how to handle.
   */
  static internalError(message: string, data?: any): Response {
    Logger.verbose('Responses.internalError');
    return Responses.error(500, message, data);
  }

  /**
   * @description The request method is not supported by the server and cannot be handled. The only methods that servers are required to support (and therefore that must not return this code) are GET and HEAD.
   */
  static notImplemented(message: string, data?: any): Response {
    Logger.verbose('Responses.notImplemented');
    return Responses.error(501, message, data);
  }

  /**
   * @description The server cannot or will not process the request due to something that is perceived to be a client error (e.g., malformed request syntax, invalid request message framing, or deceptive request routing).
   */
  static badRequest(message: string, data?: any): Response {
    Logger.verbose('Responses.badRequest');
    return Responses.error(400, message, data);
  }

  /**
   * @description Although the HTTP standard specifies "unauthorized", semantically this response means "unauthenticated". That is, the client must authenticate itself to get the requested response.
   */
  static unauthorized(message: string, data?: any): Response {
    Logger.verbose('Responses.unauthorized');
    return Responses.error(401, message, data);
  }

  /**
   * @description The client does not have access rights to the content; that is, it is unauthorized, so the server is refusing to give the requested resource. Unlike 401 Unauthorized, the client's identity is known to the server.
   */
  static forbidden(message: string, data?: any): Response {
    Logger.verbose('Responses.forbidden');
    return Responses.error(403, message, data);
  }

  /**
   * @description The server can not find the requested resource. In the browser, this means the URL is not recognized. In an API, this can also mean that the endpoint is valid but the resource itself does not exist. Servers may also send this response instead of 403 Forbidden to hide the existence of a resource from an unauthorized client. This response code is probably the most well known due to its frequent occurrence on the web.
   */
  static notFound(message: string, data?: any): Response {
    Logger.verbose('Responses.notFound');
    return Responses.error(404, message, data);
  }

  /**
   * @description The request method is known by the server but is not supported by the target resource. For example, an API may not allow calling DELETE to remove a resource.
   */
  static methodNotAllowed(message: string, data?: any): Response {
    Logger.verbose('Responses.methodNotAllowed');
    return Responses.error(405, message, data);
  }

  /**
   * @description This method returns a standard API error message based on `statusCode`. It is also the base method for all the other error methods.
   */
  static error(statusCode: number, message: string, data?: any): Response {
    Logger.verbose('Responses.error');
    const response = Responses.response(statusCode, message, data);
    Logger.error(statusCode, response);
    return response;
  }

  private static response(statusCode: number, message: string, data?: any) {
    Logger.verbose('Responses.response');
    if (data) {
      Logger.verbose('Returning body with the data parameter!');
      return {
        statusCode: statusCode,
        body: JSON.stringify({
          message,
          data,
        }),
      };
    }
    Logger.verbose('Returning body without the data parameter!');
    return {
      statusCode: statusCode,
      body: JSON.stringify({
        message,
      }),
    };
  }
}
