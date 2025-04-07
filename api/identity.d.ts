import { APIGatewayEvent } from './api-gateway.interface';
export interface UserDetails {
    id: number;
    code: string;
    firstName: string;
    lastName: string;
    email: string;
    roles: string[];
}
export declare class Identity {
    cognitoId: string;
    cognitoIdentityId: string;
    user: UserDetails;
    static fromEvent(event: APIGatewayEvent): Identity;
    constructor(cognitoId: string, cognitoIdentityId: string, user: UserDetails);
    hasRole(role: string): boolean;
    hasRoles(roleA: string): boolean;
    hasRoles(roleA: string, roleB: string): boolean;
    hasRoles(roleA: string, roleB: string, roleC: string): boolean;
    hasAllRoles(roleA: string): boolean;
    hasAllRoles(roleA: string, roleB: string): boolean;
    hasAllRoles(roleA: string, roleB: string, roleC: string): boolean;
}
