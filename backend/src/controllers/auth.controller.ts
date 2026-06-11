import type { Request, Response, NextFunction } from "express";
import * as authService from "../services/auth/auth.service.js";
import type {
  ForgotPasswordRequestBody,
  GoogleLoginRequestBody,
  LoginRequestBody,
  RegisterRequestBody,
  ResendOtpRequestBody,
  ResetPasswordRequestBody,
  UpdateProfileRequestBody,
  VerifyOtpRequestBody,
} from "../types/auth.types.js";
import { config } from "../config/env.js";

const REFRESH_COOKIE_NAME = "refreshToken";
const REFRESH_COOKIE_MAX_AGE = 7 * 24 * 60 * 60 * 1000;

const setRefreshCookie = (res: Response, token: string): void => {
  res.cookie(REFRESH_COOKIE_NAME, token, {
    httpOnly: true,
    secure: config.env === "production",
    sameSite: config.env === "production" ? "none" : "lax",
    maxAge: REFRESH_COOKIE_MAX_AGE,
  });
};

export const registerStudent = async (
  req: Request<Record<string, never>, unknown, RegisterRequestBody>,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const result = await authService.register(req.body);

    res.status(201).json({
      success: true,
      message: result.message,
    });
  } catch (error) {
    next(error);
  }
};

export const verifyOtp = async (
  req: Request<Record<string, never>, unknown, VerifyOtpRequestBody>,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const result = await authService.verifyRegistrationOtp(req.body);
    setRefreshCookie(res, result.refreshToken);

    res.status(200).json({
      success: true,
      token: result.token,
      user: result.user,
    });
  } catch (error) {
    next(error);
  }
};

export const resendOtp = async (
  req: Request<Record<string, never>, unknown, ResendOtpRequestBody>,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const result = await authService.resendRegistrationOtp(req.body);

    res.status(200).json({
      success: true,
      message: result.message,
    });
  } catch (error) {
    next(error);
  }
};

export const loginStudent = async (
  req: Request<Record<string, never>, unknown, LoginRequestBody>,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const result = await authService.login(req.body);
    setRefreshCookie(res, result.refreshToken);

    res.status(200).json({
      success: true,
      token: result.token,
      user: result.user,
    });
  } catch (error) {
    next(error);
  }
};

export const googleLoginStudent = async (
  req: Request<Record<string, never>, unknown, GoogleLoginRequestBody>,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const result = await authService.loginWithGoogle(req.body);
    setRefreshCookie(res, result.refreshToken);

    res.status(200).json({
      success: true,
      token: result.token,
      user: result.user,
    });
  } catch (error) {
    next(error);
  }
};

export const refreshToken = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const token = req.cookies?.[REFRESH_COOKIE_NAME];

    if (!token) {
      res.status(401).json({
        success: false,
        message: "Unauthorized access",
      });
      return;
    }

    const result = await authService.refreshSession(token);
    setRefreshCookie(res, result.refreshToken);

    res.status(200).json({
      success: true,
      token: result.token,
      user: result.user,
    });
  } catch (error) {
    next(error);
  }
};

export const forgotPassword = async (
  req: Request<Record<string, never>, unknown, ForgotPasswordRequestBody>,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const result = await authService.forgotPassword(req.body);

    res.status(200).json({
      success: true,
      message: result.message,
    });
  } catch (error) {
    next(error);
  }
};

export const resetPassword = async (
  req: Request<Record<string, never>, unknown, ResetPasswordRequestBody>,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const result = await authService.resetPassword(req.body);

    res.status(200).json({
      success: true,
      message: result.message,
    });
  } catch (error) {
    next(error);
  }
};

export const getAuthenticatedStudent = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({
        success: false,
        message: "Unauthorized access",
      });
      return;
    }

    const user = await authService.getProfile(req.user.userId.toString());

    res.status(200).json({
      success: true,
      user,
    });
  } catch (error) {
    next(error);
  }
};

export const updateAuthenticatedStudent = async (
  req: Request<Record<string, never>, unknown, UpdateProfileRequestBody>,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({
        success: false,
        message: "Unauthorized access",
      });
      return;
    }

    const user = await authService.updateProfile(req.user.userId.toString(), req.body);

    res.status(200).json({
      success: true,
      user,
    });
  } catch (error) {
    next(error);
  }
};

export const logoutStudent = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    res.clearCookie("refreshToken", {
      httpOnly: true,
      secure: config.env === "production",
      sameSite: config.env === "production" ? "none" : "lax",
    });

    res.status(200).json({
      success: true,
      message: "Logged out successfully",
    });
  } catch (error) {
    next(error);
  }
};
