import type { NextFunction, Request, Response } from "express";
import type { ForgotPasswordRequestBody, GoogleLoginRequestBody, LoginRequestBody, RegisterRequestBody, ResendOtpRequestBody, ResetPasswordRequestBody, UpdateProfileRequestBody, VerifyOtpRequestBody } from "../types/auth.types.js";
export declare class ValidationError extends Error {
    statusCode: number;
    constructor(message: string);
}
export declare const validateRegister: (req: Request<Record<string, never>, unknown, RegisterRequestBody, import("qs").ParsedQs, Record<string, any>>, _res: Response, next: NextFunction) => void;
export declare const validateLogin: (req: Request<Record<string, never>, unknown, LoginRequestBody, import("qs").ParsedQs, Record<string, any>>, _res: Response, next: NextFunction) => void;
export declare const validateGoogleLogin: (req: Request<Record<string, never>, unknown, GoogleLoginRequestBody, import("qs").ParsedQs, Record<string, any>>, _res: Response, next: NextFunction) => void;
export declare const validateVerifyOtp: (req: Request<Record<string, never>, unknown, VerifyOtpRequestBody, import("qs").ParsedQs, Record<string, any>>, _res: Response, next: NextFunction) => void;
export declare const validateForgotPassword: (req: Request<Record<string, never>, unknown, ForgotPasswordRequestBody, import("qs").ParsedQs, Record<string, any>>, _res: Response, next: NextFunction) => void;
export declare const validateResendOtp: (req: Request<Record<string, never>, unknown, ResendOtpRequestBody, import("qs").ParsedQs, Record<string, any>>, _res: Response, next: NextFunction) => void;
export declare const validateResetPassword: (req: Request<Record<string, never>, unknown, ResetPasswordRequestBody, import("qs").ParsedQs, Record<string, any>>, _res: Response, next: NextFunction) => void;
export declare const validateUpdateProfile: (req: Request<Record<string, never>, unknown, UpdateProfileRequestBody, import("qs").ParsedQs, Record<string, any>>, _res: Response, next: NextFunction) => void;
