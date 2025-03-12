import { APIGatewayProxyEvent, APIGatewayProxyEventV2, APIGatewayProxyWithCognitoAuthorizerEvent } from 'aws-lambda';
export declare type HTTPMethods = 'GET' | 'HEAD' | 'POST' | 'PUT' | 'DELETE' | 'CONNECT' | 'OPTIONS' | 'TRACE' | 'PATCH' | string;
export declare type APIGatewayEvent = APIGatewayProxyEvent | APIGatewayProxyEventV2;
export declare function isAPIGatewayEventV1(event: any): event is APIGatewayProxyEvent;
export declare function isAPIGatewayEventV2(event: any): event is APIGatewayProxyEventV2;
export declare function isAPIGatewayCognitoAuthorizerEvent(event: any): event is APIGatewayProxyWithCognitoAuthorizerEvent;
export declare function getHttpMethod(event: APIGatewayEvent): string;
