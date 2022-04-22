export interface GetParameterOptions {
    parseJson?: boolean;
}
export declare class SSM {
    static getParameter(app: string, parameter: string, options?: GetParameterOptions): Promise<string>;
}
