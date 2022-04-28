import {Database as InternalDatabase, ProcessOptions as InternalProcessOptions} from '../database';
import {LambdaEvent} from '../index';
import {Responses, Response} from './responses';
import {Logger} from '../logger';
import {Payload} from './payload';

/**
 * @description An optional set of parameters that can be passed to the Database.
 */
export interface ProcessOptions extends InternalProcessOptions {
}

/**
 * @description This is a wrapper class for the Database class from [`common-utils/database`](https://github.com/Cordant/common-utils/blob/master/database/index.ts) intended to be used for the APIs.
 * It maps the LambdaEvent received based on the API method and passes it as an object to the Database.
 */
export class Database {
  /**
   * @description Calls the read/write database.
   *
   * ```typescript
   * const {Database} = require('common-utils/api');
   *
   * Database.process(
   *   event,
   *   functionName,
   *   fieldsToPass,
   *   'Success Message',
   *   'Failed Message',
   *   options, // Optional
   * ).then(data => {...Bunch of code...})
   *  .catch(err => {...Bunch of code...})
   * ```
   *
   * @param event This is the value receive from the lambda directly.
   * @param functionName The name of the database stored procedure to call.
   * @param fieldsToPass The fields from the event that should be passed to the stored procedure. This order of the item in the list must match the order of the stored procedure parameters. Please note that the user id is always passed as the first argument and therefore must not be included on this list.
   * @param successMessage A user-friendly message that will be displayed to the end user when this call succeeds.
   * @param errorMessage A user-friendly message that will be displayed to the end if this call fails.
   * @param options An optional set of parameters that can be passed to the database. See [ProcessOptions](https://github.com/Cordant/common-utils/blob/master/api/index.ts#L7) for more details
   */
  static async process(event: LambdaEvent,
                       functionName: string,
                       fieldsToPass: string[],
                       successMessage: string,
                       errorMessage: string,
                       options?: ProcessOptions): Promise<Response> {
    Logger.verbose('APIDatabase.process');
    try {
      Logger.verbose('Mapping lambda event to payload!');
      const payload = Payload.fromMethod(event);
      Logger.debug(payload);
      Logger.verbose('Calling InternalDatabase.process!');
      const data = await InternalDatabase.process(payload, functionName, fieldsToPass, options);
      Logger.verbose('Creating appropriate success response object!');
      return Responses.success(successMessage, data);
    } catch (e) {
      Logger.verbose('Creating appropriate failed response object!');
      return Database.handleError(e, errorMessage);
    }
  }

  /**
   * @description Calls the read only database.
   *
   * ```typescript
   * const {Database} = require('common-utils/api');
   *
   * Database.processReadOnly(
   *   event,
   *   functionName,
   *   fieldsToPass,
   *   'Success Message',
   *   'Failed Message',
   *   options, // Optional
   * ).then(data => {...Bunch of code...})
   *  .catch(err => {...Bunch of code...})
   * ```
   *
   * @param event This is the value receive from the lambda directly.
   * @param functionName The name of the database stored procedure to call.
   * @param fieldsToPass The fields from the event that should be passed to the stored procedure. This order of the item in the list must match the order of the stored procedure parameters. Please note that the user id is always passed as the first argument and therefore must not be included on this list.
   * @param successMessage A user-friendly message that will be displayed to the end user when this call succeeds.
   * @param errorMessage A user-friendly message that will be displayed to the end if this call fails.
   * @param options An optional set of parameters that can be passed to the database. See [ProcessOptions](https://github.com/Cordant/common-utils/blob/master/api/index.ts#L7) for more details
   */
  static async processReadOnly(event: LambdaEvent,
                               functionName: string,
                               fieldsToPass: string[],
                               successMessage: string,
                               errorMessage: string,
                               options: ProcessOptions): Promise<Response> {
    Logger.verbose('APIDatabase.processReadOnly');
    try {
      Logger.verbose('Mapping lambda event to payload!');
      const payload = Payload.fromMethod(event);
      Logger.debug(payload);
      Logger.verbose('Calling InternalDatabase.processReadOnly!');
      const data = await InternalDatabase.processReadOnly(payload, functionName, fieldsToPass, options);
      Logger.verbose('Creating appropriate success response object!');
      return Responses.success(successMessage, data);
    } catch (e) {
      Logger.verbose('Creating appropriate failed response object!');
      return Database.handleError(e, errorMessage);
    }
  }

  /**
   * @description Tries to identify if the error is coming from an AWS Service and though and error based on the status code, otherwise return error as internal error (status code 500).
   *
   * @param error The error object received from the catch statement.
   * @param errorMessage A user-friendly error message that will be passed to the user in the frontend.
   * @private
   */
  private static handleError(error: any, errorMessage: string) {
    Logger.verbose('APIDatabase.handleError');
    Logger.verbose('Checking if error was thrown by AWS!');
    if (error?.$metadata?.httpStatusCode) {
      Logger.verbose('Creating AWS failed appropriate response object!');
      return Responses.error(error.$metadata.httpStatusCode, errorMessage, error);
    }
    Logger.verbose('Creating unknown failed response object!');
    return Responses.internalError(errorMessage, error);
  }
}

export * from './responses';
export * from './payload';
