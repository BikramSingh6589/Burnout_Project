import bcrypt from 'bcrypt';
import type { HydratedDocument } from 'mongoose';
import { logger } from '../../utils/logger.js';
import { sendOtpEmail, sendPasswordResetEmail } from '../../utils/email.js';

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
  student: HydratedDocument<any>,
  otp: string,
  purpose: string
): Promise<void> => {
  student.otpHash = await bcrypt.hash(otp, OTP_SALT_ROUNDS);
  student.otpExpiresAt = new Date(Date.now() + OTP_EXPIRY_MINUTES * 60 * 1000);
  student.otpAttempts = 0;
  student.otpPurpose = purpose;
  await student.save();
};

export const clearOTP = async (student: HydratedDocument<any>): Promise<void> => {
  student.otpHash = undefined;
  student.otpExpiresAt = undefined;
  student.otpAttempts = 0;
  student.otpPurpose = undefined;
  await student.save();
};

export const verifyOTP = async (
  student: HydratedDocument<any>,
  otp: string,
  purpose: string
): Promise<void> => {
  if (!student.otpHash || !student.otpExpiresAt || student.otpPurpose !== purpose) {
    throw new OtpError('Invalid OTP');
  }

  if (student.otpAttempts >= MAX_OTP_ATTEMPTS) {
    await clearOTP(student);
    throw new OtpError('Invalid OTP');
  }

  if (student.otpExpiresAt.getTime() < Date.now()) {
    await clearOTP(student);
    throw new OtpError('OTP expired');
  }

  const isMatch = await bcrypt.compare(otp, student.otpHash);

  if (!isMatch) {
    student.otpAttempts += 1;

    if (student.otpAttempts >= MAX_OTP_ATTEMPTS) {
      await clearOTP(student);
    } else {
      await student.save();
    }

    throw new OtpError('Invalid OTP');
  }
};

export const sendOTPEmail = async (email: string, otp: string, purpose: string): Promise<void> => {
  logger.info('[OTP Email] Starting send for:', email, 'purpose:', purpose);

  try {
    if (purpose === 'password_reset') {
      await sendPasswordResetEmail(email, otp);
    } else {
      await sendOtpEmail(email, otp);
    }
    logger.info('[OTP Email] Successfully sent to:', email);
  } catch (error) {
    logger.error('[OTP Email] Failed to send to:', email, 'Error:', error);
    throw new OtpError('Failed to send verification email', 500);
  }
};
