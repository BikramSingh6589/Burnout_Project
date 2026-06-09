import bcrypt from "bcrypt";
import crypto from "node:crypto";
import jwt, { type SignOptions } from "jsonwebtoken";
import type { NextFunction, Request, Response } from "express";
import type { Types } from "mongoose";
import { EmailOtp } from "../models/EmailOtp.js";
import { PasswordReset } from "../models/PasswordReset.js";
import { Student } from "../models/Student.js";
import { AccountStatus, AuthProvider } from "../types/common.types.js";
import { sendOtpEmail, sendPasswordResetEmail } from "../utils/email.js";
import { GoogleTokenVerificationError, verifyGoogleIdToken } from "../utils/googleAuth.js";
import type { IStudent } from "../models/Student.js";

const SALT_ROUNDS = 12;
const OTP_EXPIRY_MINUTES = 10;
const RESET_EXPIRY_MINUTES = 15;
const OTP_RESEND_COOLDOWN_SECONDS = 60;
const MAX_OTP_ATTEMPTS = 5;

interface JwtPayload {
  studentId: string;
  email: string;
}

interface RegisterStudentBody {
  fullName: string;
  email: string;
  password: string;
  phoneNumber?: string;
  gender?: string;
  age?: number;
}

interface LoginStudentBody {
  email: string;
  password: string;
}

interface VerifyOtpBody {
  email: string;
  otp: string;
}

interface ForgotPasswordBody {
  email: string;
}

interface ResetPasswordBody {
  email: string;
  token: string;
  password: string;
}

interface GoogleSignInBody {
  token: string;
}

class HttpError extends Error {
  statusCode: number;

  constructor(statusCode: number, message: string) {
    super(message);
    this.statusCode = statusCode;
  }
}

const getJwtSecret = (): string => {
  const secret = process.env.JWT_SECRET;
  if (!secret) {
    throw new HttpError(500, "JWT_SECRET is not configured");
  }
  return secret;
};

const signStudentToken = (studentId: Types.ObjectId, email: string): string => {
  const options: SignOptions = {
    expiresIn: (process.env.JWT_EXPIRES_IN ?? "7d") as SignOptions["expiresIn"],
  };

  return jwt.sign({ studentId: studentId.toString(), email } satisfies JwtPayload, getJwtSecret(), options);
};

const toStudentAuthSummary = (student: IStudent) => ({
  id: student._id,
  fullName: student.fullName,
  email: student.email,
  accountStatus: student.accountStatus,
  currentBurnoutScore: student.currentBurnoutScore,
  currentRiskLevel: student.currentRiskLevel,
});

const normalizeEmail = (email: string): string => email.trim().toLowerCase();

const isValidOtp = (otp: string): boolean => /^\d{6}$/.test(otp);

const generateSixDigitCode = (): string => crypto.randomInt(100000, 1000000).toString();

const minutesFromNow = (minutes: number): Date => new Date(Date.now() + minutes * 60 * 1000);

const createAndSendEmailOtp = async (student: { _id: Types.ObjectId; email: string }): Promise<void> => {
  const otp = generateSixDigitCode();
  const otpHash = await bcrypt.hash(otp, SALT_ROUNDS);

  await EmailOtp.updateMany(
    { student: student._id, purpose: "email_verification", verifiedAt: { $exists: false } },
    { $set: { verifiedAt: new Date() } },
  );

  await EmailOtp.create({
    student: student._id,
    email: student.email,
    otpHash,
    purpose: "email_verification",
    expiresAt: minutesFromNow(OTP_EXPIRY_MINUTES),
    attempts: 0,
    lastSentAt: new Date(),
  });

  await sendOtpEmail(student.email, otp);
};

export const registerStudent = async (
  req: Request<Record<string, never>, unknown, RegisterStudentBody>,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const { fullName, email, password, phoneNumber, gender, age } = req.body;

    if (!fullName || !email || !password) {
      throw new HttpError(400, "fullName, email, and password are required");
    }

    if (password.length < 8) {
      throw new HttpError(400, "Password must be at least 8 characters");
    }

    const normalizedEmail = normalizeEmail(email);
    const existingStudent = await Student.exists({ email: normalizedEmail });

    if (existingStudent) {
      throw new HttpError(409, "A student with this email already exists");
    }

    const hashedPassword = await bcrypt.hash(password, SALT_ROUNDS);
    const student = await Student.create({
      fullName,
      email: normalizedEmail,
      password: hashedPassword,
      phoneNumber,
      gender,
      age,
      authProvider: AuthProvider.Local,
      accountStatus: AccountStatus.PendingVerification,
    });

    try {
      await createAndSendEmailOtp({
        _id: student._id as Types.ObjectId,
        email: student.email,
      });
    } catch {
      await EmailOtp.deleteMany({ student: student._id });
      await Student.deleteOne({ _id: student._id });
      throw new HttpError(502, "Unable to send verification email. Please try again later");
    }

    const token = signStudentToken(student._id as Types.ObjectId, student.email);

    res.status(201).json({
      success: true,
      token,
      student: toStudentAuthSummary(student),
    });
  } catch (error) {
    next(error);
  }
};

export const googleSignIn = async (
  req: Request<Record<string, never>, unknown, GoogleSignInBody>,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const { token } = req.body;

    if (!token || typeof token !== "string" || !token.trim()) {
      throw new HttpError(400, "token is required");
    }

    const googleProfile = await verifyGoogleIdToken(token.trim());

    let student = await Student.findOne({ googleId: googleProfile.googleId });
    let isNewAccount = false;

    if (!student) {
      student = await Student.findOne({ email: googleProfile.email });
    }

    if (student) {
      if (student.accountStatus === AccountStatus.Suspended) {
        throw new HttpError(403, "Your account has been suspended");
      }

      if (student.accountStatus === AccountStatus.Inactive) {
        throw new HttpError(403, "Your account is inactive");
      }

      if (
        student.googleId &&
        student.googleId !== googleProfile.googleId
      ) {
        throw new HttpError(409, "This email is linked to a different Google account");
      }

      student.googleId = googleProfile.googleId;
      student.profilePicture = googleProfile.profilePicture ?? student.profilePicture;

      if (googleProfile.fullName) {
        student.fullName = googleProfile.fullName;
      }

      if (
        student.accountStatus === AccountStatus.PendingVerification &&
        googleProfile.emailVerified
      ) {
        student.accountStatus = AccountStatus.Active;
      }

      student.lastLoginAt = new Date();
      await student.save();
    } else {
      isNewAccount = true;
      student = await Student.create({
        fullName: googleProfile.fullName,
        email: googleProfile.email,
        authProvider: AuthProvider.Google,
        googleId: googleProfile.googleId,
        profilePicture: googleProfile.profilePicture,
        accountStatus: AccountStatus.Active,
        lastLoginAt: new Date(),
      });
    }

    const authToken = signStudentToken(student._id as Types.ObjectId, student.email);

    res.status(isNewAccount ? 201 : 200).json({
      success: true,
      token: authToken,
      student: toStudentAuthSummary(student),
    });
  } catch (error) {
    if (error instanceof GoogleTokenVerificationError) {
      next(new HttpError(error.statusCode, error.message));
      return;
    }

    if (error && typeof error === "object" && "code" in error && error.code === 11000) {
      next(new HttpError(409, "An account with this email already exists"));
      return;
    }

    next(error);
  }
};

export const loginStudent = async (
  req: Request<Record<string, never>, unknown, LoginStudentBody>,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      throw new HttpError(400, "email and password are required");
    }

    const student = await Student.findOne({ email: normalizeEmail(email) }).select("+password");

    if (!student) {
      throw new HttpError(401, "Invalid email or password");
    }

    if (student.accountStatus !== AccountStatus.Active) {
      throw new HttpError(403, "Please verify your email before logging in");
    }

    if (!student.password) {
      throw new HttpError(401, "This account uses Google sign-in. Please continue with Google");
    }

    const passwordMatches = await bcrypt.compare(password, student.password);

    if (!passwordMatches) {
      throw new HttpError(401, "Invalid email or password");
    }

    student.lastLoginAt = new Date();
    await student.save();

    const token = signStudentToken(student._id as Types.ObjectId, student.email);

    res.status(200).json({
      success: true,
      token,
      student: toStudentAuthSummary(student),
    });
  } catch (error) {
    next(error);
  }
};

export const authenticateStudent = async (
  req: Request,
  _res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const authorization = req.headers.authorization;

    if (!authorization?.startsWith("Bearer ")) {
      throw new HttpError(401, "Missing bearer token");
    }

    const token = authorization.slice("Bearer ".length);
    const decoded = jwt.verify(token, getJwtSecret()) as JwtPayload;
    const student = await Student.findById(decoded.studentId).select("_id email accountStatus");

    if (!student || student.accountStatus !== AccountStatus.Active) {
      throw new HttpError(401, "Invalid authentication token");
    }

    req.user = {
      studentId: student._id as Types.ObjectId,
      email: student.email,
    };

    next();
  } catch (error) {
    next(error);
  }
};

export const getAuthenticatedStudent = async (
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    if (!req.user) {
      throw new HttpError(401, "Authentication required");
    }

    const student = await Student.findById(req.user.studentId);

    if (!student) {
      throw new HttpError(404, "Student not found");
    }

    res.status(200).json({
      success: true,
      student,
    });
  } catch (error) {
    next(error);
  }
};

export const verifyOtp = async (
  req: Request<Record<string, never>, unknown, VerifyOtpBody>,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const { email, otp } = req.body;

    if (!email || !otp) {
      throw new HttpError(400, "email and otp are required");
    }

    if (!isValidOtp(otp)) {
      throw new HttpError(400, "OTP must be a 6-digit code");
    }

    const student = await Student.findOne({ email: normalizeEmail(email) });
    if (!student) {
      throw new HttpError(404, "Student not found");
    }

    const otpRecord = await EmailOtp.findOne({
      student: student._id,
      email: student.email,
      purpose: "email_verification",
      verifiedAt: { $exists: false },
      expiresAt: { $gt: new Date() },
    })
      .select("+otpHash")
      .sort({ createdAt: -1 });

    if (!otpRecord) {
      throw new HttpError(400, "OTP has expired. Please request a new code");
    }

    if (otpRecord.attempts >= MAX_OTP_ATTEMPTS) {
      throw new HttpError(429, "Too many invalid OTP attempts. Please request a new code");
    }

    const otpMatches = await bcrypt.compare(otp, otpRecord.otpHash);
    if (!otpMatches) {
      otpRecord.attempts += 1;
      await otpRecord.save();
      throw new HttpError(400, "Invalid OTP code");
    }

    otpRecord.verifiedAt = new Date();
    await otpRecord.save();

    student.accountStatus = AccountStatus.Active;
    await student.save();

    res.status(200).json({
      success: true,
      message: "OTP verified successfully",
    });
  } catch (error) {
    next(error);
  }
};

export const resendOtp = async (
  req: Request<Record<string, never>, unknown, ForgotPasswordBody>,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const { email } = req.body;

    if (!email) {
      throw new HttpError(400, "email is required");
    }

    const student = await Student.findOne({ email: normalizeEmail(email) });
    if (!student) {
      throw new HttpError(404, "Student not found");
    }

    if (student.accountStatus === AccountStatus.Active) {
      res.status(200).json({
        success: true,
        message: "Email is already verified",
      });
      return;
    }

    const latestOtp = await EmailOtp.findOne({
      student: student._id,
      purpose: "email_verification",
      verifiedAt: { $exists: false },
    }).sort({ createdAt: -1 });

    if (latestOtp) {
      const secondsSinceLastSend = (Date.now() - latestOtp.lastSentAt.getTime()) / 1000;
      if (secondsSinceLastSend < OTP_RESEND_COOLDOWN_SECONDS) {
        throw new HttpError(429, `Please wait ${Math.ceil(OTP_RESEND_COOLDOWN_SECONDS - secondsSinceLastSend)} seconds before requesting another OTP`);
      }
    }

    await createAndSendEmailOtp({
      _id: student._id as Types.ObjectId,
      email: student.email,
    });

    res.status(200).json({
      success: true,
      message: "A new OTP has been sent",
    });
  } catch (error) {
    next(error);
  }
};

export const forgotPassword = async (
  req: Request<Record<string, never>, unknown, ForgotPasswordBody>,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const { email } = req.body;

    if (!email) {
      throw new HttpError(400, "email is required");
    }

    const normalizedEmail = normalizeEmail(email);
    const student = await Student.findOne({ email: normalizedEmail });

    if (student) {
      const token = generateSixDigitCode();
      const tokenHash = await bcrypt.hash(token, SALT_ROUNDS);

      await PasswordReset.updateMany(
        { email: normalizedEmail, usedAt: { $exists: false } },
        { $set: { usedAt: new Date() } },
      );

      await PasswordReset.create({
        student: student._id,
        email: normalizedEmail,
        tokenHash,
        expiresAt: minutesFromNow(RESET_EXPIRY_MINUTES),
        requestedIp: req.ip,
        userAgent: req.get("user-agent"),
      });

      await sendPasswordResetEmail(normalizedEmail, token);
    }

    res.status(200).json({
      success: true,
      message: "If an account exists, password reset instructions have been sent",
    });
  } catch (error) {
    next(error);
  }
};

export const resetPassword = async (
  req: Request<Record<string, never>, unknown, ResetPasswordBody>,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const { email, token, password } = req.body;

    if (!email || !token || !password) {
      throw new HttpError(400, "email, token, and password are required");
    }

    if (!isValidOtp(token)) {
      throw new HttpError(400, "Reset token must be a 6-digit code");
    }

    if (password.length < 8) {
      throw new HttpError(400, "Password must be at least 8 characters");
    }

    const student = await Student.findOne({ email: normalizeEmail(email) }).select("+password");
    if (!student) {
      throw new HttpError(404, "Student not found");
    }

    const resetRecord = await PasswordReset.findOne({
      student: student._id,
      email: student.email,
      usedAt: { $exists: false },
      expiresAt: { $gt: new Date() },
    })
      .select("+tokenHash")
      .sort({ createdAt: -1 });

    if (!resetRecord) {
      throw new HttpError(400, "Reset token has expired. Please request a new code");
    }

    const tokenMatches = await bcrypt.compare(token, resetRecord.tokenHash);
    if (!tokenMatches) {
      throw new HttpError(400, "Invalid reset token");
    }

    student.password = await bcrypt.hash(password, SALT_ROUNDS);
    student.accountStatus = AccountStatus.Active;
    await student.save();

    resetRecord.usedAt = new Date();
    await resetRecord.save();

    res.status(200).json({
      success: true,
      message: "Password reset successfully",
    });
  } catch (error) {
    next(error);
  }
};

export { HttpError };
