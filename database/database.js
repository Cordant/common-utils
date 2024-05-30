"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.Database = void 0;
const index_1 = require("../ssm/index");
const index_2 = require("../logger/index");
const pg_promise_1 = __importDefault(require("pg-promise"));
const pgp = (0, pg_promise_1.default)();
const DEFAULT_SSM_APP = process.env.APP;
const DEFAULT_SSM_PARAMETER = process.env.SSM_PARAMETER;
const DEFAULT_READ_ONLY_SSM_PARAMETER = process.env.READ_ONLY_SSM_PARAMETER;
/**
 * @description This class handles all database connections and calls the database, it automatically retrieves all the necessary connection string based on the Environment Variables or the options passed.
 */
class Database {
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
    static process(payload, functionName, fieldsToPass, options) {
        return __awaiter(this, void 0, void 0, function* () {
            index_2.Logger.internal.verbose('Database.process');
            if (!Database.isWarmUp(payload)) {
                index_2.Logger.internal.verbose('Connecting to database!');
                const database = yield Database.connect(Object.assign(Object.assign({}, options), { isReadOnly: false }));
                index_2.Logger.internal.verbose('Calling stored procedure!');
                return Database.storedProcedure(database, payload, functionName, fieldsToPass, options);
            }
            index_2.Logger.internal.log('Function called from Warm Up trigger!');
        });
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
    static processReadOnly(payload, functionName, fieldsToPass, options) {
        return __awaiter(this, void 0, void 0, function* () {
            index_2.Logger.internal.verbose('Database.processReadOnly');
            if (!Database.isWarmUp(payload)) {
                index_2.Logger.internal.verbose('Connecting to database!');
                const database = yield Database.connect(Object.assign(Object.assign({}, options), { isReadOnly: true }));
                index_2.Logger.internal.verbose('Calling stored procedure!');
                return Database.storedProcedure(database, payload, functionName, fieldsToPass, options);
            }
            index_2.Logger.internal.log('Function called from Warm Up trigger!');
        });
    }
    /**
     * @description
     * Executes a query that can return any number of rows.
     *
     * - When no rows are returned, it resolves with an empty array.
     * - When 1 or more rows are returned, it resolves with the array of rows.
     */
    static any(query, options) {
        return __awaiter(this, void 0, void 0, function* () {
            index_2.Logger.internal.verbose('Database.any');
            const database = yield Database.connect(Object.assign(Object.assign({}, options), { isReadOnly: false }));
            index_2.Logger.internal.verbose('Calling any');
            return database.any(query);
        });
    }
    /**
     * @description Retrieves the connection string from the SSM and tries to open a connection if there isn't one open for the specified connection string.
     * @private
     */
    static connect(options) {
        var _a, _b, _c, _d;
        return __awaiter(this, void 0, void 0, function* () {
            index_2.Logger.internal.verbose('Database.connect');
            const ssmApp = (_b = (_a = options === null || options === void 0 ? void 0 : options.ssm) === null || _a === void 0 ? void 0 : _a.app) !== null && _b !== void 0 ? _b : DEFAULT_SSM_APP;
            const defaultSsmParameter = options.isReadOnly ? DEFAULT_READ_ONLY_SSM_PARAMETER : DEFAULT_SSM_PARAMETER;
            const ssmParameter = (_d = (_c = options === null || options === void 0 ? void 0 : options.ssm) === null || _c === void 0 ? void 0 : _c.parameter) !== null && _d !== void 0 ? _d : defaultSsmParameter;
            index_2.Logger.internal.verbose('Check if ssm parameters are valid!');
            if (!ssmApp || !ssmParameter) {
                index_2.Logger.internal.debug(`Received APP environment variable as ${ssmApp}`);
                index_2.Logger.internal.debug(`Received ${options.isReadOnly ? 'READ_ONLY_SSM_PARAMETER' : 'SSM_PARAMETER'} environment variable as ${ssmParameter}`);
                const message = 'SSM configuration not found! Please ensure to provide both "APP" and "SSM_PARAMETER" as an environment variable or to have passed the configuration to options.ssm';
                index_2.Logger.internal.error(500, message);
                throw new Error(message);
            }
            index_2.Logger.internal.verbose('Get parameter from SSM!');
            const connectionString = yield index_1.SSM.getParameter(ssmApp, ssmParameter);
            index_2.Logger.internal.sensitive('DB Connection String', connectionString);
            index_2.Logger.internal.verbose('Get connection if open otherwise create one!');
            return Database.getConnectionIfOpenOtherwiseCreateOne(connectionString);
        });
    }
    /**
     * @description Determines if a connection is already open for the specified connection string, otherwise it opens one.
     * @private
     */
    static getConnectionIfOpenOtherwiseCreateOne(connectionString) {
        index_2.Logger.internal.verbose('Database.getConnectionIfOpenOtherwiseCreateOne');
        let db;
        if (Database.connections[connectionString]) {
            index_2.Logger.internal.verbose('Connection is open, reusing it!');
            db = Database.connections[connectionString];
        }
        else {
            index_2.Logger.internal.verbose('Creating a new connection to use!');
            Database.connections[connectionString] = pgp({ connectionString });
            db = Database.connections[connectionString];
            index_2.Logger.internal.verbose('New connection created, using it!');
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
    static storedProcedure(db, payload, functionName, fieldsToPass, options) {
        return __awaiter(this, void 0, void 0, function* () {
            index_2.Logger.internal.verbose('Database.storedProcedure');
            index_2.Logger.internal.verbose('Building array of values to pass to function!');
            const params = [];
            if (!(options === null || options === void 0 ? void 0 : options.skipUserId)) {
                index_2.Logger.internal.verbose('Calling Database.getUserId!');
                const userId = Database.getUserId(payload, options);
                index_2.Logger.internal.verbose('Adding user id to the params!');
                params.push(userId);
            }
            for (let i = 0; i < fieldsToPass.length; i++) {
                params.push(payload[fieldsToPass[i]]);
            }
            index_2.Logger.internal.verbose('Calling function with functionName and params!');
            index_2.Logger.log(functionName, params);
            let data = yield db.func(functionName, params);
            index_2.Logger.internal.verbose('Function returned successfully!');
            index_2.Logger.internal.verbose('Formatting return value!');
            if (data instanceof Array) {
                if (data.length === 0) {
                    data = null;
                }
                else if (data[0].hasOwnProperty(functionName)) {
                    data = data[0][functionName];
                }
            }
            index_2.Logger.internal.verbose('Returning data!');
            index_2.Logger.internal.debug(data);
            return data;
        });
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
    static getUserId(payload, options) {
        var _a, _b;
        index_2.Logger.internal.verbose('Database.getUserId');
        if (options === null || options === void 0 ? void 0 : options.userId) {
            index_2.Logger.internal.debug('Overriding user id with options.userId!');
            index_2.Logger.internal.sensitive(`User ID`, options.userId);
            return options.userId;
        }
        if ((_b = (_a = payload === null || payload === void 0 ? void 0 : payload.requestContext) === null || _a === void 0 ? void 0 : _a.identity) === null || _b === void 0 ? void 0 : _b.cognitoAuthenticationProvider) {
            // cognitoAuthenticationProvider = cognito-idp.us-east-1.amazonaws.com/us-east-1_xxxxxxxxx,cognito-idp.us-east-1.amazonaws.com/us-east-1_aaaaaaaaa:CognitoSignIn:qqqqqqqq-1111-2222-3333-rrrrrrrrrrrr
            const authProvider = payload.requestContext.identity.cognitoAuthenticationProvider;
            const parts = authProvider.split(':'); // ['cognito-idp.us-east-1.amazonaws.com/us-east-1_xxxxxxxxx,cognito-idp.us-east-1.amazonaws.com/us-east-1_aaaaaaaaa', 'CognitoSignIn', 'qqqqqqqq-1111-2222-3333-rrrrrrrrrrrr']
            const userPoolUserId = parts[parts.length - 1];
            index_2.Logger.internal.debug('Overriding user id with payload.requestContext.identity.cognitoAuthenticationProvider!');
            index_2.Logger.internal.sensitive('Cognito User ID', userPoolUserId);
            return userPoolUserId;
        }
        if (payload === null || payload === void 0 ? void 0 : payload.federatedIdentityId) {
            index_2.Logger.internal.debug('Overriding user id with payload.federatedIdentityId!');
            index_2.Logger.internal.deprecated('options.userId should be used instead of payload.federatedIdentityId!');
            index_2.Logger.internal.sensitive('Federated Identity ID', payload.federatedIdentityId);
            return payload.federatedIdentityId;
        }
        const message = 'Unable to determine a user ID! Please ensure that you are calling via an API Gateway authenticated with AWS Cognito or that you have passed the options.userId manually!';
        index_2.Logger.internal.error(401, message);
        throw new Error(message);
    }
    static isWarmUp(payload) {
        index_2.Logger.internal.verbose('Database.isWarmUp');
        return !!payload.wu;
    }
}
exports.Database = Database;
Database.connections = {};
