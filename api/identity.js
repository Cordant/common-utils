"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Identity = void 0;
const api_gateway_interface_1 = require("./api-gateway.interface");
const responses_1 = require("./responses");
class Identity {
    static fromEvent(event) {
        if ((0, api_gateway_interface_1.isHttpApiEventWithAuthorizer)(event)) {
            const { cognitoId, cognitoIdentityId, user } = event.requestContext.authorizer.lambda;
            return new Identity(cognitoId, cognitoIdentityId, JSON.parse(user));
        }
        throw responses_1.Responses.unauthorized('No authorizer context found!');
    }
    constructor(cognitoId, cognitoIdentityId, user) {
        this.cognitoId = cognitoId;
        this.cognitoIdentityId = cognitoIdentityId;
        this.user = user;
    }
    hasRole(role) {
        return this.user.roles.includes(role);
    }
    /**
     * @description Check if user has any of the given roles
     */
    hasRoles(...roles) {
        for (const role of roles) {
            if (this.hasRole(role))
                return true;
        }
        return false;
    }
    /**
     * @description Check if user has all the given roles
     */
    hasAllRoles(...roles) {
        for (const role of roles) {
            if (!this.hasRole(role))
                return false;
        }
        return true;
    }
}
exports.Identity = Identity;
