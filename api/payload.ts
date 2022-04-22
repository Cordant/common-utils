import {LambdaEvent} from '../index';
import {ProcessPayload} from '../database';
import {Logger} from '../logger';

export class Payload {
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

  static fromPath(event: LambdaEvent): ProcessPayload {
    Logger.verbose('Payload.fromPathParams');
    return Payload.determineTypes(event.pathParameters);
  }

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
