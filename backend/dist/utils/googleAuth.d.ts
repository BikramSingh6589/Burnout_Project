export interface GoogleUserProfile {
    googleId: string;
    email: string;
    fullName: string;
    profilePicture?: string;
    emailVerified: boolean;
}
export declare class GoogleTokenVerificationError extends Error {
    statusCode: number;
    constructor(statusCode: number, message: string);
}
export declare const verifyGoogleIdToken: (idToken: string) => Promise<GoogleUserProfile>;
