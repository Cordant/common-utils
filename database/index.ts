import {SSM} from '../ssm/index';
import {Logger} from '../logger/index';
import pgPromise from 'pg-promise';
import {IClient} from 'pg-promise/typescript/pg-subset';

const pgp = pgPromise();

const DEFAULT_SSM_APP = process.env.APP;
const DEFAULT_SSM_PARAMETER = process.env.SSM_PARAMETER;
const DEFAULT_READ_ONLY_SSM_PARAMETER = process.env.READ_ONLY_SSM_PARAMETER;

export type FederatedIdentityId = string;

/**
 * @example
 */
export type CognitoUserId = string;

/**
 * @description This is either a user federated identity id or a Cognito User Identity ID
 */
export type UserId = FederatedIdentityId | CognitoUserId;

/**
 * @description Optional parameters that can be used to modify the default values.
 */
export interface ProcessOptions {
  /**
   * @description Pass this value if you wish to change modify the database that the method will call. If not passed it will default to use the environment variables `DEFAULT_SSM_APP` and `DEFAULT_SSM_PARAMETER` or `DEFAULT_READ_ONLY_SSM_PARAMETER` if its called from `Database.processReadOnly`
   */
  ssm?: { app: string, parameter: string };
  /**
   * @description Pass this value if you wish to modify the UserId that will be calling the database with. This option is required if the call isn't coming via an API authenticate with a Cognito User Pool.
   */
  userId?: UserId; // federatedId required if no environment one
}

interface ConnectOptions extends ProcessOptions {
  isReadOnly: boolean;
}

export interface ProcessPayload {
  /**
   * @deprecated Deprecated in favour of `options.userId`
   */
  federatedIdentityId?: string;

  [key: string]: any;
}

/**
 * @description This class handles all database connections and calls the database, it automatically retrieves all the necessary connection string based on the Environment Variables or the options passed.
 */
export class Database {
  private static connections: { [key: string]: pgPromise.IDatabase<IClient> } = {};

  /**
   * @description Calls the read/write database.
   *
   * ```javascript
   * const {Database} = require('common-utils/database');
   *
   * Database.process(
   *   event,
   *   functionName,
   *   fieldsToPass,
   *   options, // Optional
   * ).then(data => {...Bunch of code...})
   *  .catch(err => {...Bunch of code...})
   * ```
   *
   * @param payload The object that the data will be extracted from.
   * @param functionName The name of the database stored procedure to call.
   * @param fieldsToPass The fields from the event that should be passed to the stored procedure. This order of the item in the list must match the order of the stored procedure parameters. Please note that the user id is always passed as the first argument and therefore must not be included on this list.
   * @param options Optional parameters that can be used to modify the default values.
   */
  static async process(payload: ProcessPayload,
                       functionName: string,
                       fieldsToPass: string[],
                       options?: ProcessOptions): Promise<any> {
    Logger.verbose('Database.process');
    if (!Database.isWarmUp(payload)) {
      Logger.verbose('Connecting to database!');
      const database = await Database.connect({...options, isReadOnly: false});
      Logger.verbose('Calling stored procedure!');
      return Database.storedProcedure(database, payload, functionName, fieldsToPass, options);
    }
    Logger.log('Function called from Warm Up trigger!');
  }

  /**
   * @description Calls the read only database.
   *
   * ```javascript
   * const {Database} = require('common-utils/database');
   *
   * Database.processReadOnly(
   *   event,
   *   functionName,
   *   fieldsToPass,
   *   options, // Optional
   * ).then(data => {...Bunch of code...})
   *  .catch(err => {...Bunch of code...})
   * ```
   *
   * @param payload The object that the data will be extracted from.
   * @param functionName The name of the database stored procedure to call.
   * @param fieldsToPass The fields from the event that should be passed to the stored procedure. This order of the item in the list must match the order of the stored procedure parameters. Please note that the user id is always passed as the first argument and therefore must not be included on this list.
   * @param options Optional parameters that can be used to modify the default values.
   */
  static async processReadOnly(payload: ProcessPayload,
                               functionName: string,
                               fieldsToPass: string[],
                               options?: ProcessOptions): Promise<any> {
    Logger.verbose('Database.processReadOnly');
    if (!Database.isWarmUp(payload)) {
      Logger.verbose('Connecting to database!');
      const database = await Database.connect({...options, isReadOnly: true});
      Logger.verbose('Calling stored procedure!');
      return Database.storedProcedure(database, payload, functionName, fieldsToPass, options);
    }
    Logger.log('Function called from Warm Up trigger!');
  }

  /**
   * @description Retrieves the connection string from the SSM and tries to open a connection if there isn't one open for the specified connection string.
   * @private
   */
  private static async connect(options: ConnectOptions): Promise<pgPromise.IDatabase<IClient>> {
    Logger.verbose('Database.connect');
    const ssmApp = options?.ssm?.app ?? DEFAULT_SSM_APP;
    const defaultSsmParameter = options.isReadOnly ? DEFAULT_READ_ONLY_SSM_PARAMETER : DEFAULT_SSM_PARAMETER;
    const ssmParameter = options?.ssm?.parameter ?? defaultSsmParameter;
    Logger.verbose('Check if ssm parameters are valid!');
    if (!ssmApp || !ssmParameter) {
      Logger.debug(`Received APP environment variable as ${ssmApp}`);
      Logger.debug(`Received ${options.isReadOnly ? 'READ_ONLY_SSM_PARAMETER' : 'SSM_PARAMETER'} environment variable as ${ssmParameter}`);
      const message = 'SSM configuration not found! Please ensure to provide both "APP" and "SSM_PARAMETER" as an environment variable or to have passed the configuration to options.ssm';
      Logger.error(500, message);
      throw new Error(message);
    }

    Logger.verbose('Get parameter from SSM!');
    const connectionString = await SSM.getParameter(ssmApp, ssmParameter);
    Logger.sensitive('DB Connection String', connectionString);

    Logger.verbose('Get connection if open otherwise create one!');
    return Database.getConnectionIfOpenOtherwiseCreateOne(connectionString);
  }

  /**
   * @description Determines if a connection is already open for the specified connection string, otherwise it opens one.
   * @private
   */
  private static getConnectionIfOpenOtherwiseCreateOne(connectionString: string): pgPromise.IDatabase<IClient> {
    Logger.verbose('Database.getConnectionIfOpenOtherwiseCreateOne');
    let db: pgPromise.IDatabase<IClient>;
    if (Database.connections[connectionString]) {
      Logger.verbose('Connection is open, reusing it!');
      db = Database.connections[connectionString];
    } else {
      Logger.verbose('Creating a new connection to use!');
      Database.connections[connectionString] = pgp({connectionString});
      db = Database.connections[connectionString];
      Logger.verbose('New connection created, using it!');
    }
    return db;
  }

  /**
   * @description Maps the payload based on the fieldsToPass values, and calls the database stored procedure with the name passed on functionName.
   *
   * @param db The Database object used to call the function on.
   * @param payload The object that the data will be extracted from.
   * @param functionName The name of the database stored procedure to call.
   * @param fieldsToPass The fields from the event that should be passed to the stored procedure. This order of the item in the list must match the order of the stored procedure parameters. Please note that the user id is always passed as the first argument and therefore must not be included on this list.
   * @param options Optional parameters that can be used to modify the default values.
   * @private
   */
  private static async storedProcedure(db: pgPromise.IDatabase<IClient>,
                                       payload: ProcessPayload,
                                       functionName: string,
                                       fieldsToPass: string[],
                                       options?: ProcessOptions): Promise<any> {
    Logger.verbose('Database.storedProcedure');
    Logger.verbose('Calling Database.getUserId!');
    const userId = Database.getUserId(payload, options);
    Logger.verbose('Building array of values to pass to function!');
    const params = [userId];
    for (let i = 0; i < fieldsToPass.length; i++) {
      params.push(payload[fieldsToPass[i]]);
    }
    Logger.verbose('Calling function with functionName and params!');
    Logger.debug(functionName, params);
    let data = await db.func(functionName, params);
    Logger.verbose('Function returned successfully!');
    Logger.verbose('Formatting return value!');
    if (data instanceof Array) {
      if (data.length === 0) {
        data = null;
      } else if (data[0].hasOwnProperty(functionName)) {
        data = data[0][functionName];
      }
    }
    Logger.verbose('Returning data!');
    Logger.debug(data);
    return data;
  }

  /**
   * @description Gets the user id from the payload and options. The user id is determined using the following order.
   *
   * 1. options.userId
   * 2. payload.requestContext.identity.cognitoAuthenticationProvider
   * 3. payload.federatedIdentityId - should be avoided as its currently deprecated in favour of options.userId.
   *
   * It unable to get a User ID it will throw an error.
   *
   * @param payload The object that the data will be extracted from. This is used to determine the Cognito User Identity ID.
   * @param options Options to override the userId.
   * @private
   */
  private static getUserId(payload: ProcessPayload, options?: ProcessOptions): UserId {
    Logger.verbose('Database.getUserId');
    if (options?.userId) {
      Logger.debug('Overriding user id with options.userId!');
      Logger.sensitive(`User ID`, options.userId);
      return options.userId;
    }
    if (payload?.requestContext?.identity?.cognitoAuthenticationProvider) {
      // cognitoAuthenticationProvider = cognito-idp.us-east-1.amazonaws.com/us-east-1_xxxxxxxxx,cognito-idp.us-east-1.amazonaws.com/us-east-1_aaaaaaaaa:CognitoSignIn:qqqqqqqq-1111-2222-3333-rrrrrrrrrrrr
      const authProvider = payload.requestContext.identity.cognitoAuthenticationProvider;
      const parts = authProvider.split(':'); // ['cognito-idp.us-east-1.amazonaws.com/us-east-1_xxxxxxxxx,cognito-idp.us-east-1.amazonaws.com/us-east-1_aaaaaaaaa', 'CognitoSignIn', 'qqqqqqqq-1111-2222-3333-rrrrrrrrrrrr']
      const userPoolUserId = parts[parts.length - 1];
      Logger.debug('Overriding user id with payload.requestContext.identity.cognitoAuthenticationProvider!');
      Logger.sensitive('Cognito User ID', userPoolUserId);
      return userPoolUserId;
    }
    if (payload?.federatedIdentityId) {
      Logger.debug('Overriding user id with payload.federatedIdentityId!');
      Logger.deprecated('options.userId should be used instead of payload.federatedIdentityId!');
      Logger.sensitive('Federated Identity ID', payload.federatedIdentityId);
      return payload.federatedIdentityId;
    }
    const message = 'Unable to determine a user ID! Please ensure that you are calling via an API Gateway authenticated with AWS Cognito or that you have passed the options.userId manually!';
    Logger.error(401, message);
    throw new Error(message);
  }

  private static isWarmUp(payload: ProcessPayload) {
    Logger.verbose('Database.isWarmUp');
    return !!payload.wu;
  }
}
