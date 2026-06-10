import { type Document, type Model } from "mongoose";
import { AccountStatus, Gender, RiskLevel } from "../types/common.types.js";
import type { OtpPurpose } from "../types/auth.types.js";
export interface IStudentProfile {
    department?: string;
    program?: string;
    yearOfStudy?: number;
    enrollmentNumber?: string;
    guardianContact?: string;
    emergencyContact?: string;
}
export interface IStudent extends Document {
    fullName: string;
    email: string;
    phoneNumber?: string;
    gender?: Gender;
    age?: number;
    password: string;
    profile?: IStudentProfile;
    accountStatus: AccountStatus;
    currentBurnoutScore: number;
    currentRiskLevel: RiskLevel;
    otpHash?: string;
    otpExpiresAt?: Date;
    otpAttempts: number;
    otpPurpose?: OtpPurpose;
    emailVerifiedAt?: Date;
    lastLoginAt?: Date;
    createdAt: Date;
    updatedAt: Date;
}
export declare const Student: Model<IStudent>;
