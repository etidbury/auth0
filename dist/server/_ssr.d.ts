export declare const checkIsAuthenticated: (ctx?: any) => boolean;
export declare const getAccessToken: (ctx?: any) => string;
export declare const authorizeViaPopup: (optionalParams?: {}) => Promise<{
    idToken: string;
    accessToken?: string | undefined;
    expiresIn: string;
    idTokenPayload?: {} | undefined;
}>;
export declare const logout: (redirectTo: any) => void;
export declare const getUserInfo: (accessToken: any) => Promise<any>;
export declare const dateAddDay: (days: any) => Date;
export declare const setUserId: (userId: string) => void;
export declare const getUserId: (ctx?: any) => string;
