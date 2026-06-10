import { type Document, type Model } from "mongoose";
import { AccountStatus, AdminRole } from "../types/common.types.js";
export interface IAdmin extends Document {
    fullName: string;
    email: string;
    password: string;
    role: AdminRole;
    accountStatus: AccountStatus;
    lastLoginAt?: Date;
    createdAt: Date;
    updatedAt: Date;
}
export declare const Admin: Model<IAdmin>;
