export declare type FederatedIdentityId = string;
/**
 * @example
 */
export declare type CognitoUserId = string;
/**
 * @description This is either a user federated identity id or a Cognito User Identity ID
 */
export declare type UserId = FederatedIdentityId | CognitoUserId;
/**
 * @description Optional parameters that can be used to modify the default values.
 */
export interface ProcessOptions {
    /**
     * @description Pass this value if you wish to change modify the database that the method will call. If not passed it will default to use the environment variables `DEFAULT_SSM_APP` and `DEFAULT_SSM_PARAMETER` or `DEFAULT_READ_ONLY_SSM_PARAMETER` if its called from `Database.processReadOnly`
     */
    ssm?: {
        app: string;
        parameter: string;
    };
    /**
     * @description Pass this value if you wish to modify the UserId that will be calling the database with. This option is required if the call isn't coming via an API authenticate with a Cognito User Pool.
     */
    userId?: UserId;
    /**
     * @description Pass this value if you wish to skip the user id being passed to the stored procedure.
     * This is useful when the stored procedure doesn't require a user id.
     * This is ignored when using `Database.any`
     */
    skipUserId?: boolean;
}
export interface ProcessPayload {
    /**
     * @deprecated Deprecated in favour of `options.userId`
     */
    federatedIdentityId?: string;
    wu?: boolean;
    [key: string]: any;
}
/**
 * @description This class handles all database connections and calls the database, it automatically retrieves all the necessary connection string based on the Environment Variables or the options passed.
 */
export declare class Database {
    private static connections;
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
    static process(payload: ProcessPayload, functionName: string, fieldsToPass: string[], options?: ProcessOptions): Promise<any>;
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
    static processReadOnly(payload: ProcessPayload, functionName: string, fieldsToPass: string[], options?: ProcessOptions): Promise<any>;
    /**
     * @description
     * Executes a query that can return any number of rows.
     *
     * - When no rows are returned, it resolves with an empty array.
     * - When 1 or more rows are returned, it resolves with the array of rows.
     */
    static any(query: string, options: ProcessOptions): Promise<any[]>;
    /**
     * @description Retrieves the connection string from the SSM and tries to open a connection if there isn't one open for the specified connection string.
     * @private
     */
    private static connect;
    /**
     * @description Determines if a connection is already open for the specified connection string, otherwise it opens one.
     * @private
     */
    private static getConnectionIfOpenOtherwiseCreateOne;
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
    private static storedProcedure;
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
    private static getUserId;
    private static isWarmUp;
}
