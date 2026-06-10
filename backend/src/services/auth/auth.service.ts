import bcrypt from "bcrypt";
import crypto from "node:crypto";
import { Student, type IStudent } from "../../models/Student.js";
import { AccountStatus } from "../../types/common.types.js";
import type {
  ForgotPasswordRequestBody,
  GoogleLoginRequestBody,
  LoginRequestBody,
  PublicUserProfile,
  RegisterRequestBody,
  ResendOtpRequestBody,
  ResetPasswordRequestBody,
  UpdateProfileRequestBody,
  VerifyOtpRequestBody,
} from "../../types/auth.types.js";
import { clearOTP, generateOTP, saveOTP, sendOTPEmail, verifyOTP } from "./otp.service.js";
import { generateRefreshToken, generateToken, verifyRefreshToken } from "./token.service.js";
import { verifyGoogleIdToken } from "../../utils/googleAuth.js";

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
  profileCompleted: !!student.profileCompleted,
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
    profileCompleted: !!(payload.age && payload.gender),
  });

  const otp = generateOTP();
  await saveOTP(student, otp, "email_verification");
  await sendOTPEmail(student.email, otp, "email_verification");

  return { message: "OTP sent successfully" };
};

export const verifyRegistrationOtp = async (payload: VerifyOtpRequestBody): Promise<{ token: string; refreshToken: string; user: PublicUserProfile }> => {
  const student = await Student.findOne({ email: payload.email }).select(OTP_SELECT_FIELDS);

  if (!student) {
    throw new AuthError("Invalid OTP");
  }

  await verifyOTP(student, payload.otp, "email_verification");

  student.accountStatus = AccountStatus.Active;
  student.emailVerifiedAt = new Date();
  await clearOTP(student);
  student.profileCompleted = !!(student.age && student.gender);

  const token = generateToken(student._id.toString(), student.email, "student");
  const refreshToken = generateRefreshToken(student._id.toString(), student.email, "student");

  return { token, refreshToken, user: toPublicUserProfile(student) };
};

export const resendRegistrationOtp = async (payload: ResendOtpRequestBody): Promise<{ message: string }> => {
  const student = await Student.findOne({ email: payload.email }).select(OTP_SELECT_FIELDS);

  if (!student) {
    throw new AuthError("User not found", 404);
  }

  if (student.accountStatus === AccountStatus.Active) {
    throw new AuthError("Email is already verified", 409);
  }

  const otp = generateOTP();
  await saveOTP(student, otp, "email_verification");
  await sendOTPEmail(student.email, otp, "email_verification");

  return { message: "OTP sent successfully" };
};

export const login = async (payload: LoginRequestBody): Promise<{ token: string; refreshToken: string; user: PublicUserProfile }> => {
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
  const refreshToken = generateRefreshToken(student._id.toString(), student.email, "student");

  return {
    token,
    refreshToken,
    user: toPublicUserProfile(student),
  };
};

export const loginWithGoogle = async (payload: GoogleLoginRequestBody): Promise<{ token: string; refreshToken: string; user: PublicUserProfile }> => {
  const googleProfile = await verifyGoogleIdToken(payload.token);
  let student = await Student.findOne({ email: googleProfile.email });

  if (!student) {
    const randomPassword = crypto.randomBytes(32).toString("hex");
    const hashedPassword = await bcrypt.hash(randomPassword, PASSWORD_SALT_ROUNDS);

    student = await Student.create({
      fullName: googleProfile.fullName,
      email: googleProfile.email,
      password: hashedPassword,
      accountStatus: AccountStatus.Active,
      emailVerifiedAt: new Date(),
      profileCompleted: false,
    });
  } else if (student.accountStatus !== AccountStatus.Active) {
    student.accountStatus = AccountStatus.Active;
    student.emailVerifiedAt = student.emailVerifiedAt ?? new Date();
  }

  student.lastLoginAt = new Date();
  await student.save();

  const token = generateToken(student._id.toString(), student.email, "student");
  const refreshToken = generateRefreshToken(student._id.toString(), student.email, "student");

  return {
    token,
    refreshToken,
    user: toPublicUserProfile(student),
  };
};

export const refreshSession = async (refreshToken: string): Promise<{ token: string; refreshToken: string; user: PublicUserProfile }> => {
  const payload = verifyRefreshToken(refreshToken);
  const student = await Student.findById(payload.userId);

  if (!student || student.accountStatus !== AccountStatus.Active) {
    throw new AuthError("Unauthorized access", 401);
  }

  return {
    token: generateToken(student._id.toString(), student.email, "student"),
    refreshToken: generateRefreshToken(student._id.toString(), student.email, "student"),
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

export const updateProfile = async (userId: string, payload: UpdateProfileRequestBody): Promise<PublicUserProfile> => {
  const student = await Student.findById(userId);

  if (!student) {
    throw new AuthError("User not found", 404);
  }

  student.fullName = payload.name;
  student.phoneNumber = payload.phoneNumber;
  student.age = payload.age;
  student.gender = payload.gender;
  student.profileCompleted = !!(student.age && student.gender);
  await student.save();

  return toPublicUserProfile(student);
};
