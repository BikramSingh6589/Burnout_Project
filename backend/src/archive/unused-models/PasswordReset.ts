import { Schema, model, type Document, type Model, type Types } from "mongoose";

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

const PasswordResetSchema = new Schema<IPasswordReset>(
  {
    student: {
      type: Schema.Types.ObjectId,
      ref: "Student",
      index: true,
    },
    admin: {
      type: Schema.Types.ObjectId,
      ref: "Admin",
      index: true,
    },
    email: {
      type: String,
      required: true,
      lowercase: true,
      trim: true,
      index: true,
      match: [/^\S+@\S+\.\S+$/, "Invalid email address"],
    },
    tokenHash: {
      type: String,
      required: true,
      unique: true,
      select: false,
    },
    expiresAt: {
      type: Date,
      required: true,
      index: true,
    },
    usedAt: Date,
    requestedIp: { type: String, trim: true },
    userAgent: { type: String, trim: true },
  },
  { timestamps: true },
);

PasswordResetSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });
PasswordResetSchema.index({ email: 1, usedAt: 1, createdAt: -1 });

export const PasswordReset: Model<IPasswordReset> = model<IPasswordReset>(
  "PasswordReset",
  PasswordResetSchema,
);
