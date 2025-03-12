"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getHttpMethod = exports.isAPIGatewayCognitoAuthorizerEvent = exports.isAPIGatewayEventV2 = exports.isAPIGatewayEventV1 = void 0;
function isAPIGatewayEventV1(event) {
    return !!(event === null || event === void 0 ? void 0 : event.httpMethod);
}
exports.isAPIGatewayEventV1 = isAPIGatewayEventV1;
function isAPIGatewayEventV2(event) {
    return (event === null || event === void 0 ? void 0 : event.version) === '2.0';
}
exports.isAPIGatewayEventV2 = isAPIGatewayEventV2;
function isAPIGatewayCognitoAuthorizerEvent(event) {
    var _a, _b;
    return !!((_b = (_a = event === null || event === void 0 ? void 0 : event.requestContext) === null || _a === void 0 ? void 0 : _a.authorizer) === null || _b === void 0 ? void 0 : _b.claims);
}
exports.isAPIGatewayCognitoAuthorizerEvent = isAPIGatewayCognitoAuthorizerEvent;
function getHttpMethod(event) {
    if (isAPIGatewayEventV1(event)) {
        return event.httpMethod.toUpperCase();
    }
    if (isAPIGatewayEventV2(event)) {
        return event.requestContext.http.method.toUpperCase();
    }
    throw new Error('Unknown event type!');
}
exports.getHttpMethod = getHttpMethod;
