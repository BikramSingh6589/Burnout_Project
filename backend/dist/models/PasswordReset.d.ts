import { type Document, type Model, type Types } from "mongoose";
export interface IPasswordReset extends Document {
    student?: Types.ObjectId;
    admin?: Types.ObjectId;
    email: string;
    tokenHash: string;
    expiresAt: Date;
    usedAt?: Date;
    requestedIp?: string;
    userAgent?: string;
    createdAt: Date;
    updatedAt: Date;
}
export declare const PasswordReset: Model<IPasswordReset>;
