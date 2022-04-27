import {LambdaEvent} from '../index';
import {ProcessPayload} from '../database';
import {Logger} from '../logger';

/**
 * @description This class is intended to enforce a standard for API payload.
 */
export class Payload {
  /**
   * @description Attempts to identify the payload that should be passed to the Database based on the method.
   * The resulting payload is mapped as follows:
   * - GET -> Items from API path and query parameter only
   * - PUT -> Items from API path and body only
   * - POST -> Items from API path and body only
   * - DELETE -> Items from API path and query parameter only
   * - HEAD -> Items from API path and query parameter only
   *
   * All other methods are defaulted to API path, query parameter and body. Although using other methods should be avoided!
   */
  static fromMethod(event: LambdaEvent): ProcessPayload {
    Logger.verbose('Payload.fromMethod');
    Logger.verbose('Determining payload from httpMethod!');
    Logger.debug('Mapping payload for method:', event.httpMethod);
    switch (event.httpMethod) {
      case 'PUT':
      case 'POST':
        return {
          ...Payload.fromPath(event),
          ...Payload.fromBody(event),
        };
      case 'DELETE':
      case 'GET':
      case 'HEAD':
        return {
          ...Payload.fromPath(event),
          ...Payload.fromQueryParams(event),
        };
      default:
        return {
          ...Payload.fromPath(event),
          ...Payload.fromQueryParams(event),
          ...Payload.fromBody(event),
        };
    }
  }

  /**
   * @description Maps all items from `event.body` to an object.
   */
  static fromBody(event: LambdaEvent): ProcessPayload {
    Logger.verbose('Payload.fromBody');
    Logger.verbose('Checking event.body for nulls!');
    if (!event.body) {
      Logger.verbose('event.body is null, returning empty object!');
      return {};
    }
    Logger.verbose('Parsing data and returning values!');
    return JSON.parse(event.body);
  }

  /**
   * @description Maps all items from `event.pathParameters` to an object, it also attempts to parse the items to its correct type. Since `event.pathParameters` is an object of type `{[key: string]: string}` where all values are string. This methods attempts to identify the type of the value and parse it.
   *
   * If event is `{pathParameters: {item1: "test", item2: "2", item3: "[]', item4: '{"obj": "value"}'}}` it will parse the values to `{pathParameters: {item1: "test", item2: 2, item3: [], item4: {obj: "value"}}}`.
   *
   */
  static fromPath(event: LambdaEvent): ProcessPayload {
    Logger.verbose('Payload.fromPathParams');
    return Payload.determineTypes(event.pathParameters);
  }

  /**
   * @description Maps all items from `event.queryStringParameters` to an object, it also attempts to parse the items to its correct type. Since `event.queryStringParameters` is an object of type `{[key: string]: string}` where all values are string. This methods attempts to identify the type of the value and parse it.
   *
   * If event is `{pathParameters: {item1: "test", item2: "2", item3: "[]', item4: '{"obj": "value"}'}}` it will parse the values to `{pathParameters: {item1: "test", item2: 2, item3: [], item4: {obj: "value"}}}`.
   *
   */
  static fromQueryParams(event: LambdaEvent): ProcessPayload {
    Logger.verbose('Payload.fromQueryParams');
    return Payload.determineTypes(event.queryStringParameters);
  }

  private static determineTypes(payload?: { [key: string]: string; }) {
    Logger.verbose('Payload.determineTypes');
    Logger.verbose('Checking payload for nulls');
    if (!payload) {
      Logger.verbose('Payload is null returning empty object!');
      return {};
    }
    Logger.verbose('Creating object to add the data');
    const result: { [key: string]: any } = {};
    Logger.verbose('Adding data to object');
    for (const key in payload) {
      if (payload.hasOwnProperty(key)) {
        Logger.verbose('Adding new data!');
        result[key] = Payload.determineType(payload[key]);
      }
    }
    Logger.verbose('Returning mapped data!');
    return result;
  }

  private static determineType(value: string) {
    Logger.verbose('Payload.determineType');
    Logger.verbose('Checking null');
    if (value === 'null') {
      return null;
    }
    Logger.verbose('Checking undefined');
    if (value === 'undefined') {
      return undefined;
    }
    try {
      Logger.verbose('Trying to parse!');
      return JSON.parse(value);
    } catch (e) {
      Logger.verbose('Failed to parse, returning as a string!');
      return value;
    }
  }
}
