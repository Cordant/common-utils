import { APIGatewayProxyEvent, APIGatewayProxyEventV2, APIGatewayProxyEventV2WithLambdaAuthorizer, APIGatewayProxyWithCognitoAuthorizerEvent } from 'aws-lambda';
export type HTTPMethods = 'GET' | 'HEAD' | 'POST' | 'PUT' | 'DELETE' | 'CONNECT' | 'OPTIONS' | 'TRACE' | 'PATCH' | string;
export interface CognitoAuthorizerContext {
    /**
     * @description Cognito ID
     */
    cognitoId: string;
    /**
     * @description Cognito Identity ID or Cognito Federated Identity ID
     */
    cognitoIdentityId: string;
    /**
     * @description Stringified JSON of UserDetails
     */
    user: string;
}
export type RestApiEvent = APIGatewayProxyEvent;
export type HttpApiEvent = APIGatewayProxyEventV2;
export type HttpApiEventWithAuthorizer = APIGatewayProxyEventV2WithLambdaAuthorizer<CognitoAuthorizerContext>;
export type APIGatewayEvent = RestApiEvent | HttpApiEvent | HttpApiEventWithAuthorizer;
export declare function isRestApiEvent(event: any): event is RestApiEvent;
export declare function isHttpApiEvent(event: any): event is HttpApiEvent;
export declare function isHttpApiEventWithAuthorizer(event: any): event is HttpApiEventWithAuthorizer;
export declare function isRestApiCognitoAuthorizerEvent(event: any): event is APIGatewayProxyWithCognitoAuthorizerEvent;
export declare function getHttpMethod(event: APIGatewayEvent): string;
