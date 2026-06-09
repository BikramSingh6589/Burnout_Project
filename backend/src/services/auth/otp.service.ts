import bcrypt from "bcrypt";
import nodemailer from "nodemailer";
import type { HydratedDocument } from "mongoose";
import { config } from "../../config/env.js";
import type { IStudent } from "../../models/Student.js";
import type { OtpPurpose } from "../../types/auth.types.js";

const OTP_EXPIRY_MINUTES = 10;
const MAX_OTP_ATTEMPTS = 5;
const OTP_SALT_ROUNDS = 10;

export class OtpError extends Error {
  statusCode: number;

  constructor(message: string, statusCode = 400) {
    super(message);
    this.statusCode = statusCode;
  }
}

export const generateOTP = (): string => {
  return Math.floor(100000 + Math.random() * 900000).toString();
};

export const saveOTP = async (
  student: HydratedDocument<IStudent>,
  otp: string,
  purpose: OtpPurpose,
): Promise<void> => {
  student.otpHash = await bcrypt.hash(otp, OTP_SALT_ROUNDS);
  student.otpExpiresAt = new Date(Date.now() + OTP_EXPIRY_MINUTES * 60 * 1000);
  student.otpAttempts = 0;
  student.otpPurpose = purpose;
  await student.save();
};

export const clearOTP = async (student: HydratedDocument<IStudent>): Promise<void> => {
  student.otpHash = undefined;
  student.otpExpiresAt = undefined;
  student.otpAttempts = 0;
  student.otpPurpose = undefined;
  await student.save();
};

export const verifyOTP = async (
  student: HydratedDocument<IStudent>,
  otp: string,
  purpose: OtpPurpose,
): Promise<void> => {
  if (!student.otpHash || !student.otpExpiresAt || student.otpPurpose !== purpose) {
    throw new OtpError("Invalid OTP");
  }

  if (student.otpAttempts >= MAX_OTP_ATTEMPTS) {
    await clearOTP(student);
    throw new OtpError("Invalid OTP");
  }

  if (student.otpExpiresAt.getTime() < Date.now()) {
    await clearOTP(student);
    throw new OtpError("OTP expired");
  }

  const isMatch = await bcrypt.compare(otp, student.otpHash);

  if (!isMatch) {
    student.otpAttempts += 1;

    if (student.otpAttempts >= MAX_OTP_ATTEMPTS) {
      await clearOTP(student);
    } else {
      await student.save();
    }

    throw new OtpError("Invalid OTP");
  }
};

export const sendOTPEmail = async (email: string, otp: string, purpose: OtpPurpose): Promise<void> => {
  if (!config.emailUser || !config.emailPassword) {
    throw new OtpError("Email service is not configured", 500);
  }

  const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: config.emailUser,
      pass: config.emailPassword,
    },
  });

  const subject = purpose === "password_reset" ? "Password Reset OTP" : "Email Verification OTP";
  const text =
    purpose === "password_reset"
      ? `Your password reset OTP is ${otp}. It expires in ${OTP_EXPIRY_MINUTES} minutes.`
      : `Your email verification OTP is ${otp}. It expires in ${OTP_EXPIRY_MINUTES} minutes.`;

  await transporter.sendMail({
    from: config.emailUser,
    to: email,
    subject,
    text,
  });
};
