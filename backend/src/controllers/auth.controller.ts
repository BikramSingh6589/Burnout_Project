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
