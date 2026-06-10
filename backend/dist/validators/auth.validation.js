import { z } from "zod";
import { Gender } from "../types/common.types.js";
export class ValidationError extends Error {
    statusCode = 400;
    constructor(message) {
        super(message);
    }
}
const passwordSchema = z
    .string()
    .trim()
    .min(8, "Password must be at least 8 characters long")
    .max(128, "Password must be 128 characters or fewer")
    .regex(/[A-Z]/, "Password must contain at least 1 capital letter")
    .regex(/[a-z]/, "Password must contain at least 1 lowercase letter")
    .regex(/\d/, "Password must contain at least 1 number")
    .regex(/[^A-Za-z0-9]/, "Password must contain at least 1 special character");
const emailSchema = z.string().trim().toLowerCase().email("Valid email is required");
const otpSchema = z.string().trim().regex(/^\d{6}$/, "OTP must be exactly 6 digits");
const genderSchema = z.preprocess((value) => (typeof value === "string" ? value.trim().toLowerCase() : value), z.enum(Gender, { error: "Valid gender is required" }));
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
const googleLoginSchema = z.object({
    token: z.string().trim().min(1, "Google token is required"),
});
const verifyOtpSchema = z.object({
    email: emailSchema,
    otp: otpSchema,
});
const forgotPasswordSchema = z.object({
    email: emailSchema,
});
const resendOtpSchema = z.object({
    email: emailSchema,
});
const resetPasswordSchema = z.object({
    email: emailSchema,
    otp: otpSchema,
    newPassword: passwordSchema,
});
const updateProfileSchema = z.object({
    name: z.string().trim().min(2, "Name must be between 2 and 50 characters").max(50, "Name must be between 2 and 50 characters"),
    phoneNumber: z.string().trim().optional(),
    age: z.coerce.number().int("Age must be between 16 and 100").min(16, "Age must be between 16 and 100").max(100, "Age must be between 16 and 100"),
    gender: genderSchema,
});
const extractMessage = (error) => {
    return error.issues[0]?.message ?? "Validation failed";
};
const validate = (schema) => (req, _res, next) => {
    const result = schema.safeParse(req.body);
    if (!result.success) {
        next(new ValidationError(extractMessage(result.error)));
        return;
    }
    req.body = result.data;
    next();
};
export const validateRegister = validate(registerSchema);
export const validateLogin = validate(loginSchema);
export const validateGoogleLogin = validate(googleLoginSchema);
export const validateVerifyOtp = validate(verifyOtpSchema);
export const validateForgotPassword = validate(forgotPasswordSchema);
export const validateResendOtp = validate(resendOtpSchema);
export const validateResetPassword = validate(resetPasswordSchema);
export const validateUpdateProfile = validate(updateProfileSchema);
//# sourceMappingURL=auth.validation.js.map