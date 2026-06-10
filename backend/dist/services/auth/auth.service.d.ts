import type { ForgotPasswordRequestBody, GoogleLoginRequestBody, LoginRequestBody, PublicUserProfile, RegisterRequestBody, ResendOtpRequestBody, ResetPasswordRequestBody, UpdateProfileRequestBody, VerifyOtpRequestBody } from "../../types/auth.types.js";
export declare class AuthError extends Error {
    statusCode: number;
    constructor(message: string, statusCode?: number);
}
export declare const register: (payload: RegisterRequestBody) => Promise<{
    message: string;
}>;
export declare const verifyRegistrationOtp: (payload: VerifyOtpRequestBody) => Promise<{
    token: string;
    refreshToken: string;
    user: PublicUserProfile;
}>;
export declare const resendRegistrationOtp: (payload: ResendOtpRequestBody) => Promise<{
    message: string;
}>;
export declare const login: (payload: LoginRequestBody) => Promise<{
    token: string;
    refreshToken: string;
    user: PublicUserProfile;
}>;
export declare const loginWithGoogle: (payload: GoogleLoginRequestBody) => Promise<{
    token: string;
    refreshToken: string;
    user: PublicUserProfile;
}>;
export declare const refreshSession: (refreshToken: string) => Promise<{
    token: string;
    refreshToken: string;
    user: PublicUserProfile;
}>;
export declare const forgotPassword: (payload: ForgotPasswordRequestBody) => Promise<{
    message: string;
}>;
export declare const resetPassword: (payload: ResetPasswordRequestBody) => Promise<{
    message: string;
}>;
export declare const getProfile: (userId: string) => Promise<PublicUserProfile>;
export declare const updateProfile: (userId: string, payload: UpdateProfileRequestBody) => Promise<PublicUserProfile>;
