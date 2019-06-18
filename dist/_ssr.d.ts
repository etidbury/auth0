export declare const checkIsAuthenticated: (ctx?: any) => boolean;
export declare const getAccessToken: (ctx?: any) => string;
export declare class Auth0LockHelper {
    private _lock;
    constructor(clientId: string, domain: string, audience: string, redirectURL: string, optionalParams?: {});
    authorizeViaPopup(optionalParams?: {}): Promise<{
        idToken: string;
        accessToken?: string;
        expiresIn: string;
        idTokenPayload?: {};
    }>;
    getUserInfo(ctx?: any): Promise<any>;
}
export declare const logout: (redirectTo: any) => void;
export declare const dateAddDay: (days: any) => Date;
export declare const setUserId: (userId: string) => void;
export declare const getUserId: (ctx?: any) => string;
