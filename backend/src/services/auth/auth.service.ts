import bcrypt from "bcrypt";
import { Student, type IStudent } from "../../models/Student.js";
import { AccountStatus } from "../../types/common.types.js";
import type {
  ForgotPasswordRequestBody,
  LoginRequestBody,
  PublicUserProfile,
  RegisterRequestBody,
  ResetPasswordRequestBody,
  VerifyOtpRequestBody,
} from "../../types/auth.types.js";
import { clearOTP, generateOTP, saveOTP, sendOTPEmail, verifyOTP } from "./otp.service.js";
import { generateToken } from "./token.service.js";

const PASSWORD_SALT_ROUNDS = 10;
const PASSWORD_SELECT_FIELDS = "+password +otpHash +otpExpiresAt +otpAttempts +otpPurpose";
const OTP_SELECT_FIELDS = "+otpHash +otpExpiresAt +otpAttempts +otpPurpose";
const FORGOT_PASSWORD_MESSAGE = "If the account exists, an OTP has been sent.";

export class AuthError extends Error {
  statusCode: number;

  constructor(message: string, statusCode = 400) {
    super(message);
    this.statusCode = statusCode;
  }
}

const toPublicUserProfile = (student: IStudent): PublicUserProfile => ({
  id: student._id.toString(),
  name: student.fullName,
  email: student.email,
  age: student.age,
  gender: student.gender,
  accountStatus: student.accountStatus,
});

export const register = async (payload: RegisterRequestBody): Promise<{ message: string }> => {
  const existingStudent = await Student.exists({ email: payload.email });

  if (existingStudent) {
    throw new AuthError("Email already registered", 409);
  }

  const hashedPassword = await bcrypt.hash(payload.password, PASSWORD_SALT_ROUNDS);
  const student = await Student.create({
    fullName: payload.name,
    email: payload.email,
    password: hashedPassword,
    age: payload.age,
    gender: payload.gender,
    accountStatus: AccountStatus.PendingVerification,
  });

  const otp = generateOTP();
  await saveOTP(student, otp, "email_verification");
  await sendOTPEmail(student.email, otp, "email_verification");

  return { message: "OTP sent successfully" };
};

export const verifyRegistrationOtp = async (payload: VerifyOtpRequestBody): Promise<{ token: string }> => {
  const student = await Student.findOne({ email: payload.email }).select(OTP_SELECT_FIELDS);

  if (!student) {
    throw new AuthError("Invalid OTP");
  }

  await verifyOTP(student, payload.otp, "email_verification");

  student.accountStatus = AccountStatus.Active;
  student.emailVerifiedAt = new Date();
  await clearOTP(student);

  const token = generateToken(student._id.toString(), student.email, "student");

  return { token };
};

export const login = async (payload: LoginRequestBody): Promise<{ token: string; user: PublicUserProfile }> => {
  const student = await Student.findOne({ email: payload.email }).select(PASSWORD_SELECT_FIELDS);

  if (!student) {
    throw new AuthError("Invalid email or password", 401);
  }

  const passwordMatches = await bcrypt.compare(payload.password, student.password);

  if (!passwordMatches) {
    throw new AuthError("Invalid email or password", 401);
  }

  if (student.accountStatus !== AccountStatus.Active) {
    throw new AuthError("Please verify your email before logging in", 403);
  }

  student.lastLoginAt = new Date();
  await student.save();

  const token = generateToken(student._id.toString(), student.email, "student");

  return {
    token,
    user: toPublicUserProfile(student),
  };
};

export const forgotPassword = async (payload: ForgotPasswordRequestBody): Promise<{ message: string }> => {
  const student = await Student.findOne({ email: payload.email }).select(OTP_SELECT_FIELDS);

  if (!student) {
    return { message: FORGOT_PASSWORD_MESSAGE };
  }

  const otp = generateOTP();
  await saveOTP(student, otp, "password_reset");
  await sendOTPEmail(student.email, otp, "password_reset");

  return { message: FORGOT_PASSWORD_MESSAGE };
};

export const resetPassword = async (payload: ResetPasswordRequestBody): Promise<{ message: string }> => {
  const student = await Student.findOne({ email: payload.email }).select(PASSWORD_SELECT_FIELDS);

  if (!student) {
    throw new AuthError("Invalid OTP");
  }

  await verifyOTP(student, payload.otp, "password_reset");

  student.password = await bcrypt.hash(payload.newPassword, PASSWORD_SALT_ROUNDS);
  await clearOTP(student);

  return { message: "Password reset successfully" };
};

export const getProfile = async (userId: string): Promise<PublicUserProfile> => {
  const student = await Student.findById(userId);

  if (!student) {
    throw new AuthError("User not found", 404);
  }

  return toPublicUserProfile(student);
};
