import { APIGatewayEvent } from './api-gateway.interface';
/**
 * @description This class is intended to enforce a standard for API payload.
 */
export declare class Payload {
    [key: string]: any;
    /**
     * @description Attempts to identify the payload that should be passed to the Database based on the method.
     * The resulting payload is mapped as follows:
     * - GET -> Items from API path and query parameter only
     * - PUT -> Items from API path and body only
     * - POST -> Items from API path and body only
     * - DELETE -> Items from API path and query parameter only
     * - HEAD -> Items from API path and query parameter only
     *
     * All other methods are defaulted to API path, query parameter and body. Although using other methods should be avoided!
     */
    static fromMethod(event: APIGatewayEvent): Payload;
    /**
     * @description Maps all items from `event.body` to an object.
     */
    static fromBody(event: APIGatewayEvent): Payload;
    /**
     * @description Maps all items from `event.pathParameters` to an object, it also attempts to parse the items to its correct type. Since `event.pathParameters` is an object of type `{[key: string]: string}` where all values are string. This methods attempts to identify the type of the value and parse it.
     *
     * If event is `{pathParameters: {item1: "test", item2: "2", item3: "[]', item4: '{"obj": "value"}'}}` it will parse the values to `{pathParameters: {item1: "test", item2: 2, item3: [], item4: {obj: "value"}}}`.
     *
     */
    static fromPath(event: APIGatewayEvent): Payload;
    /**
     * @description Maps all items from `event.queryStringParameters` to an object, it also attempts to parse the items to its correct type. Since `event.queryStringParameters` is an object of type `{[key: string]: string}` where all values are string. This methods attempts to identify the type of the value and parse it.
     *
     * If event is `{pathParameters: {item1: "test", item2: "2", item3: "[]', item4: '{"obj": "value"}'}}` it will parse the values to `{pathParameters: {item1: "test", item2: 2, item3: [], item4: {obj: "value"}}}`.
     *
     */
    static fromQueryParams(event: APIGatewayEvent): Payload;
    constructor(payload?: {
        [key: string]: any;
    }, tryToResolveTypes?: boolean);
    private determineType;
}
