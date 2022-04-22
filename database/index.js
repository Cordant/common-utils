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
class Database {
    static process(payload, functionName, fieldsToPass, options) {
        return __awaiter(this, void 0, void 0, function* () {
            index_2.Logger.verbose('Database.process');
            if (!Database.isWarmUp(payload)) {
                index_2.Logger.verbose('Connecting to database!');
                const database = yield Database.connect(Object.assign(Object.assign({}, options), { isReadOnly: false }));
                index_2.Logger.verbose('Calling stored procedure!');
                return Database.storedProcedure(database, payload, functionName, fieldsToPass, options);
            }
            index_2.Logger.log('Function called from Warm Up trigger!');
        });
    }
    static processReadOnly(payload, functionName, fieldsToPass, options) {
        return __awaiter(this, void 0, void 0, function* () {
            index_2.Logger.verbose('Database.processReadOnly');
            if (!Database.isWarmUp(payload)) {
                index_2.Logger.verbose('Connecting to database!');
                const database = yield Database.connect(Object.assign(Object.assign({}, options), { isReadOnly: true }));
                index_2.Logger.verbose('Calling stored procedure!');
                return Database.storedProcedure(database, payload, functionName, fieldsToPass, options);
            }
            index_2.Logger.log('Function called from Warm Up trigger!');
        });
    }
    static storedProcedure(db, payload, functionName, fieldsToPass, options) {
        return __awaiter(this, void 0, void 0, function* () {
            index_2.Logger.verbose('Database.storedProcedure');
            index_2.Logger.verbose('Calling Database.getUserId!');
            const cognitoId = Database.getUserId(payload, options);
            index_2.Logger.verbose('Building array of values to pass to function!');
            const params = [cognitoId];
            for (let i = 0; i < fieldsToPass.length; i++) {
                params.push(payload[fieldsToPass[i]]);
            }
            index_2.Logger.verbose('Calling function with functionName and params!');
            index_2.Logger.debug(functionName, params);
            let data = yield db.func(functionName, params);
            index_2.Logger.verbose('Function returned successfully!');
            index_2.Logger.verbose('Formatting return value!');
            if (data instanceof Array) {
                if (data.length === 0) {
                    data = null;
                }
                else if (data[0].hasOwnProperty(functionName)) {
                    data = data[0][functionName];
                }
            }
            index_2.Logger.verbose('Returning data!');
            index_2.Logger.debug(data);
            return data;
        });
    }
    static isWarmUp(payload) {
        index_2.Logger.verbose('Database.isWarmUp');
        return !!payload.wu;
    }
    static getUserId(payload, options) {
        var _a, _b;
        index_2.Logger.verbose('Database.getUserId');
        if (options === null || options === void 0 ? void 0 : options.federatedIdentityId) {
            index_2.Logger.debug('Overriding user id with options.federatedIdentityId!');
            index_2.Logger.sensitive(`Federated Identity ID`, options.federatedIdentityId);
            return options.federatedIdentityId;
        }
        if ((_b = (_a = payload === null || payload === void 0 ? void 0 : payload.requestContext) === null || _a === void 0 ? void 0 : _a.identity) === null || _b === void 0 ? void 0 : _b.cognitoAuthenticationProvider) {
            // cognitoAuthenticationProvider = cognito-idp.us-east-1.amazonaws.com/us-east-1_xxxxxxxxx,cognito-idp.us-east-1.amazonaws.com/us-east-1_aaaaaaaaa:CognitoSignIn:qqqqqqqq-1111-2222-3333-rrrrrrrrrrrr
            const authProvider = payload.requestContext.identity.cognitoAuthenticationProvider;
            const parts = authProvider.split(':'); // ['cognito-idp.us-east-1.amazonaws.com/us-east-1_xxxxxxxxx,cognito-idp.us-east-1.amazonaws.com/us-east-1_aaaaaaaaa', 'CognitoSignIn', 'qqqqqqqq-1111-2222-3333-rrrrrrrrrrrr']
            const userPoolUserId = parts[parts.length - 1];
            index_2.Logger.debug('Overriding user id with payload.requestContext.identity.cognitoAuthenticationProvider!');
            index_2.Logger.sensitive('Cognito User ID', userPoolUserId);
            return userPoolUserId;
        }
        if (payload === null || payload === void 0 ? void 0 : payload.federatedIdentityId) {
            index_2.Logger.debug('Overriding user id with payload.federatedIdentityId!');
            index_2.Logger.deprecated('options.federatedIdentityId should be used instead of payload.federatedIdentityId!');
            index_2.Logger.sensitive('Federated Identity ID', payload.federatedIdentityId);
            return payload.federatedIdentityId;
        }
        const message = 'Unable to determine a user ID! Please ensure that you are calling via an API Gateway authenticated with AWS Cognito or that you have passed the options.federatedIdentityId manually!';
        index_2.Logger.error(401, message);
        throw new Error(message);
    }
    static connect(options) {
        var _a, _b, _c, _d;
        return __awaiter(this, void 0, void 0, function* () {
            index_2.Logger.verbose('Database.connect');
            const ssmApp = (_b = (_a = options === null || options === void 0 ? void 0 : options.ssm) === null || _a === void 0 ? void 0 : _a.app) !== null && _b !== void 0 ? _b : DEFAULT_SSM_APP;
            const defaultSsmParameter = options.isReadOnly ? DEFAULT_READ_ONLY_SSM_PARAMETER : DEFAULT_SSM_PARAMETER;
            const ssmParameter = (_d = (_c = options === null || options === void 0 ? void 0 : options.ssm) === null || _c === void 0 ? void 0 : _c.parameter) !== null && _d !== void 0 ? _d : defaultSsmParameter;
            index_2.Logger.verbose('Check if ssm parameters are valid!');
            if (!ssmApp || !ssmParameter) {
                index_2.Logger.debug(`Received APP environment variable as ${ssmApp}`);
                index_2.Logger.debug(`Received ${options.isReadOnly ? 'READ_ONLY_SSM_PARAMETER' : 'SSM_PARAMETER'} environment variable as ${ssmParameter}`);
                const message = 'SSM configuration not found! Please ensure to provide both "APP" and "SSM_PARAMETER" as an environment variable or to have passed the configuration to options.ssm';
                index_2.Logger.error(500, message);
                throw new Error(message);
            }
            index_2.Logger.verbose('Get parameter from SSM!');
            const connectionString = yield index_1.SSM.getParameter(ssmApp, ssmParameter);
            index_2.Logger.sensitive('DB Connection String', connectionString);
            index_2.Logger.verbose('Get connection if open otherwise create one!');
            return Database.getConnectionIfOpenOtherwiseCreateOne(connectionString);
        });
    }
    static getConnectionIfOpenOtherwiseCreateOne(connectionString) {
        index_2.Logger.verbose('Database.getConnectionIfOpenOtherwiseCreateOne');
        let db;
        if (Database.connections[connectionString]) {
            index_2.Logger.verbose('Connection is open, reusing it!');
            db = Database.connections[connectionString];
        }
        else {
            index_2.Logger.verbose('Creating a new connection to use!');
            Database.connections[connectionString] = pgp({ connectionString });
            db = Database.connections[connectionString];
            index_2.Logger.verbose('New connection created, using it!');
        }
        return db;
    }
}
exports.Database = Database;
Database.connections = {};
