import {SSM} from '../ssm/index';
import {Logger} from '../logger/index';
import pgPromise from 'pg-promise';
import {IClient} from 'pg-promise/typescript/pg-subset';

const pgp = pgPromise();

const DEFAULT_SSM_APP = process.env.APP;
const DEFAULT_SSM_PARAMETER = process.env.SSM_PARAMETER;
const DEFAULT_READ_ONLY_SSM_PARAMETER = process.env.READ_ONLY_SSM_PARAMETER;

export interface ProcessOptions {
  ssm?: { app: string, parameter: string };
  federatedIdentityId?: string; // federatedId required if no environment one
}

interface ConnectOptions extends ProcessOptions {
  isReadOnly: boolean;
}

export interface ProcessPayload {
  [key: string]: any;
}

export class Database {
  private static connections: { [key: string]: pgPromise.IDatabase<IClient> } = {};

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

  private static async storedProcedure(db: pgPromise.IDatabase<IClient>,
                                       payload: ProcessPayload,
                                       functionName: string,
                                       fieldsToPass: string[],
                                       options?: ProcessOptions): Promise<any> {
    Logger.verbose('Database.storedProcedure');
    Logger.verbose('Calling Database.getUserId!');
    const cognitoId = Database.getUserId(payload, options);
    Logger.verbose('Building array of values to pass to function!');
    const params = [cognitoId];
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

  private static isWarmUp(payload: ProcessPayload) {
    Logger.verbose('Database.isWarmUp');
    return !!payload.wu;
  }

  private static getUserId(payload: ProcessPayload, options?: ProcessOptions) {
    Logger.verbose('Database.getUserId');
    if (options?.federatedIdentityId) {
      Logger.debug('Overriding user id with options.federatedIdentityId!');
      Logger.sensitive(`Federated Identity ID`, options.federatedIdentityId);
      return options.federatedIdentityId;
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
      Logger.deprecated('options.federatedIdentityId should be used instead of payload.federatedIdentityId!');
      Logger.sensitive('Federated Identity ID', payload.federatedIdentityId);
      return payload.federatedIdentityId;
    }
    const message = 'Unable to determine a user ID! Please ensure that you are calling via an API Gateway authenticated with AWS Cognito or that you have passed the options.federatedIdentityId manually!';
    Logger.error(401, message);
    throw new Error(message);
  }

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
}
