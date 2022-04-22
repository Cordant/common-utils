export interface ProcessOptions {
    ssm?: {
        app: string;
        parameter: string;
    };
    federatedIdentityId?: string;
}
export interface ProcessPayload {
    [key: string]: any;
}
export declare class Database {
    private static connections;
    static process(payload: ProcessPayload, functionName: string, fieldsToPass: string[], options?: ProcessOptions): Promise<any>;
    static processReadOnly(payload: ProcessPayload, functionName: string, fieldsToPass: string[], options?: ProcessOptions): Promise<any>;
    private static storedProcedure;
    private static isWarmUp;
    private static getUserId;
    private static connect;
    private static getConnectionIfOpenOtherwiseCreateOne;
}
