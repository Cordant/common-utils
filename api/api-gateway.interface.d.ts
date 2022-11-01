export declare type HTTPMethods = 'GET' | 'HEAD' | 'POST' | 'PUT' | 'DELETE' | 'CONNECT' | 'OPTIONS' | 'TRACE' | 'PATCH' | string;
export interface APIGatewayHeaders {
    origin: string;
    [key: string]: string;
}
export interface APIGatewayMultiValueHeaders {
    [key: string]: string[];
}
export interface APIGatewayQueryStringParameters {
    [key: string]: string;
}
export interface APIGatewayMultiValueQueryStringParameters {
    [key: string]: string[];
}
export interface APIGatewayPathParameters {
    [key: string]: string;
}
export interface APIGatewayStageVariables {
    [key: string]: string;
}
export declare type APIGatewayEvent = Partial<{
    resource: string;
    path: string;
    httpMethod: HTTPMethods;
    headers: APIGatewayHeaders;
    multiValueHeaders: APIGatewayMultiValueHeaders;
    queryStringParameters: APIGatewayQueryStringParameters;
    multiValueQueryStringParameters: APIGatewayMultiValueQueryStringParameters;
    pathParameters: APIGatewayPathParameters;
    stageVariables: APIGatewayStageVariables;
    requestContext: {
        resourceId: string;
        resourcePath: string;
        httpMethod: HTTPMethods;
        extendedRequestId: string;
        requestTime: string;
        path: string;
        accountId: string;
        protocol: string;
        stage: string;
        domainPrefix: string;
        requestTimeEpoch: number;
        requestId: string;
        identity: {
            cognitoIdentityPoolId: string;
            accountId: string;
            cognitoIdentityId: string;
            caller: string;
            sourceIp: string;
            principalOrgId: string;
            [key: string]: any;
        };
        domainName: string;
        apiId: string;
        [key: string]: any;
    };
    body: string;
    isBase64Encoded: boolean;
    [key: string]: any;
}>;
