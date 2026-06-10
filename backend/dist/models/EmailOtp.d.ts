import { type Document, type Model, type Types } from "mongoose";
export interface IEmailOtp extends Document {
    student: Types.ObjectId;
    email: string;
    otpHash: string;
    purpose: "email_verification";
    expiresAt: Date;
    attempts: number;
    lastSentAt: Date;
    verifiedAt?: Date;
    createdAt: Date;
    updatedAt: Date;
}
export declare const EmailOtp: Model<IEmailOtp>;
