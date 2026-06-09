import bcrypt from "bcrypt";
import jwt, { type SignOptions } from "jsonwebtoken";
import type { NextFunction, Request, Response } from "express";
import type { Types } from "mongoose";
import { Student } from "../models/Student.js";
import { AccountStatus } from "../types/common.types.js";

const SALT_ROUNDS = 12;

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

const normalizeEmail = (email: string): string => email.trim().toLowerCase();

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
    });

    const token = signStudentToken(student._id as Types.ObjectId, student.email);

    res.status(201).json({
      success: true,
      token,
      student: {
        id: student._id,
        fullName: student.fullName,
        email: student.email,
        accountStatus: student.accountStatus,
        currentBurnoutScore: student.currentBurnoutScore,
        currentRiskLevel: student.currentRiskLevel,
      },
    });
  } catch (error) {
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
      throw new HttpError(403, "Student account is not active");
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
      student: {
        id: student._id,
        fullName: student.fullName,
        email: student.email,
        accountStatus: student.accountStatus,
        currentBurnoutScore: student.currentBurnoutScore,
        currentRiskLevel: student.currentRiskLevel,
      },
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

export { HttpError };
