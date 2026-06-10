import type { HydratedDocument } from "mongoose";
import type { IStudent } from "../../models/Student.js";
import type { OtpPurpose } from "../../types/auth.types.js";
export declare class OtpError extends Error {
    statusCode: number;
    constructor(message: string, statusCode?: number);
}
export declare const generateOTP: () => string;
export declare const saveOTP: (student: HydratedDocument<IStudent>, otp: string, purpose: OtpPurpose) => Promise<void>;
export declare const clearOTP: (student: HydratedDocument<IStudent>) => Promise<void>;
export declare const verifyOTP: (student: HydratedDocument<IStudent>, otp: string, purpose: OtpPurpose) => Promise<void>;
export declare const sendOTPEmail: (email: string, otp: string, purpose: OtpPurpose) => Promise<void>;
