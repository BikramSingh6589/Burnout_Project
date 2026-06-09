import type { NextFunction, Request, Response } from "express";
import { z } from "zod";
import { Gender } from "../types/common.types.js";
import type {
  ForgotPasswordRequestBody,
  LoginRequestBody,
  RegisterRequestBody,
  ResetPasswordRequestBody,
  VerifyOtpRequestBody,
} from "../types/auth.types.js";

export class ValidationError extends Error {
  statusCode = 400;

  constructor(message: string) {
    super(message);
  }
}

const passwordSchema = z
  .string()
  .trim()
  .min(8, "Password does not meet security requirements")
  .max(128, "Password does not meet security requirements")
  .regex(/[A-Z]/, "Password does not meet security requirements")
  .regex(/[a-z]/, "Password does not meet security requirements")
  .regex(/\d/, "Password does not meet security requirements")
  .regex(/[^A-Za-z0-9]/, "Password does not meet security requirements");

const emailSchema = z.string().trim().toLowerCase().email("Valid email is required");
const otpSchema = z.string().trim().regex(/^\d{6}$/, "OTP must be exactly 6 digits");

const genderSchema = z.preprocess(
  (value) => (typeof value === "string" ? value.trim().toLowerCase() : value),
  z.enum(Gender, { error: "Valid gender is required" }),
);

const registerSchema = z.object({
  name: z.string().trim().min(2, "Name must be between 2 and 50 characters").max(50, "Name must be between 2 and 50 characters"),
  email: emailSchema,
  password: passwordSchema,
  age: z.coerce.number().int("Age must be between 16 and 100").min(16, "Age must be between 16 and 100").max(100, "Age must be between 16 and 100"),
  gender: genderSchema,
});

const loginSchema = z.object({
  email: z.string().trim().toLowerCase().email("Invalid email or password"),
  password: z.string().trim().min(1, "Invalid email or password"),
});

const verifyOtpSchema = z.object({
  email: emailSchema,
  otp: otpSchema,
});

const forgotPasswordSchema = z.object({
  email: emailSchema,
});

const resetPasswordSchema = z.object({
  email: emailSchema,
  otp: otpSchema,
  newPassword: passwordSchema,
});

type RequestValidator<TBody> = z.ZodType<TBody>;

const extractMessage = (error: z.ZodError): string => {
  return error.issues[0]?.message ?? "Validation failed";
};

const validate =
  <TBody>(schema: RequestValidator<TBody>) =>
  (req: Request<Record<string, never>, unknown, TBody>, _res: Response, next: NextFunction): void => {
    const result = schema.safeParse(req.body);

    if (!result.success) {
      next(new ValidationError(extractMessage(result.error)));
      return;
    }

    req.body = result.data;
    next();
  };

export const validateRegister = validate<RegisterRequestBody>(registerSchema);
export const validateLogin = validate<LoginRequestBody>(loginSchema);
export const validateVerifyOtp = validate<VerifyOtpRequestBody>(verifyOtpSchema);
export const validateForgotPassword = validate<ForgotPasswordRequestBody>(forgotPasswordSchema);
export const validateResetPassword = validate<ResetPasswordRequestBody>(resetPasswordSchema);
