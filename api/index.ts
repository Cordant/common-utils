import {Database as InternalDatabase, ProcessOptions as InternalProcessOptions} from '../database';
import {LambdaEvent} from '../index';
import {Responses} from './responses';
import {Logger} from '../logger';
import {Payload} from './payload';

export interface ProcessOptions extends InternalProcessOptions {
}

export class Database {
  static async process(event: LambdaEvent,
                       functionName: string,
                       fieldsToPass: string[],
                       successMessage: string,
                       errorMessage: string,
                       options?: ProcessOptions) {
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

  static async processReadOnly(event: LambdaEvent,
                               functionName: string,
                               fieldsToPass: string[],
                               successMessage: string,
                               errorMessage: string,
                               options: ProcessOptions) {
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
