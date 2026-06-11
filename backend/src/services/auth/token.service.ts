import jwt, { type SignOptions } from "jsonwebtoken";
import { Types } from "mongoose";
import { config } from "../../config/env.js";
import type { AuthenticatedUser, AuthRole, JwtTokenPayload } from "../../types/auth.types.js";

const TOKEN_EXPIRY: SignOptions["expiresIn"] = "2d";
const REFRESH_TOKEN_EXPIRY: SignOptions["expiresIn"] = "7d";

export const generateToken = (userId: Types.ObjectId | string, email: string, role: AuthRole): string => {
  const payload: JwtTokenPayload = {
    userId: userId.toString(),
    email,
    role,
  };

  return jwt.sign(payload, config.jwtSecret, { expiresIn: TOKEN_EXPIRY });
};

export const generateRefreshToken = (userId: Types.ObjectId | string, email: string, role: AuthRole): string => {
  const payload: JwtTokenPayload = {
    userId: userId.toString(),
    email,
    role,
  };

  return jwt.sign(payload, config.jwtRefreshSecret, { expiresIn: REFRESH_TOKEN_EXPIRY });
};

export const verifyToken = (token: string): AuthenticatedUser => {
  const decoded = jwt.verify(token, config.jwtSecret) as JwtTokenPayload;

  if (!decoded.userId || !decoded.email || decoded.role !== "student" || !Types.ObjectId.isValid(decoded.userId)) {
    throw new Error("Unauthorized access");
  }

  return {
    userId: new Types.ObjectId(decoded.userId),
    email: decoded.email,
    role: decoded.role,
  };
};

export const verifyRefreshToken = (token: string): AuthenticatedUser => {
  const decoded = jwt.verify(token, config.jwtRefreshSecret) as JwtTokenPayload;

  if (!decoded.userId || !decoded.email || decoded.role !== "student" || !Types.ObjectId.isValid(decoded.userId)) {
    throw new Error("Unauthorized access");
  }

  return {
    userId: new Types.ObjectId(decoded.userId),
    email: decoded.email,
    role: decoded.role,
  };
};
