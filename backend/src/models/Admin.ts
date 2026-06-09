import { Schema, model, type Document, type Model } from "mongoose";
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

const AdminSchema = new Schema<IAdmin>(
  {
    fullName: {
      type: String,
      required: true,
      trim: true,
      minlength: 2,
      maxlength: 120,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
      match: [/^\S+@\S+\.\S+$/, "Invalid email address"],
    },
    password: {
      type: String,
      required: true,
      select: false,
      minlength: 8,
    },
    role: {
      type: String,
      enum: Object.values(AdminRole),
      default: AdminRole.Counselor,
      index: true,
    },
    accountStatus: {
      type: String,
      enum: Object.values(AccountStatus),
      default: AccountStatus.Active,
      index: true,
    },
    lastLoginAt: Date,
  },
  {
    timestamps: true,
  },
);

AdminSchema.index({ role: 1, accountStatus: 1 });

export const Admin: Model<IAdmin> = model<IAdmin>("Admin", AdminSchema);
