import { Schema, model, type Document, type Model, type Types } from "mongoose";

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

const EmailOtpSchema = new Schema<IEmailOtp>(
  {
    student: {
      type: Schema.Types.ObjectId,
      ref: "Student",
      required: true,
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
    otpHash: {
      type: String,
      required: true,
      select: false,
    },
    purpose: {
      type: String,
      enum: ["email_verification"],
      default: "email_verification",
      index: true,
    },
    expiresAt: {
      type: Date,
      required: true,
      index: true,
    },
    attempts: {
      type: Number,
      default: 0,
      min: 0,
    },
    lastSentAt: {
      type: Date,
      required: true,
    },
    verifiedAt: Date,
  },
  { timestamps: true },
);

EmailOtpSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });
EmailOtpSchema.index({ email: 1, purpose: 1, verifiedAt: 1, createdAt: -1 });

export const EmailOtp: Model<IEmailOtp> = model<IEmailOtp>("EmailOtp", EmailOtpSchema);
