import type { ObjectId } from "./common.types.js";
import { Gender } from "./common.types.js";

export type AuthRole = "student";

export type OtpPurpose = "email_verification" | "password_reset";

export interface RegisterRequestBody {
  name: string;
  email: string;
  password: string;
  age: number;
  gender: Gender;
}

export interface LoginRequestBody {
  email: string;
  password: string;
}

export interface GoogleLoginRequestBody {
  token: string;
}

export interface VerifyOtpRequestBody {
  email: string;
  otp: string;
}

export interface ForgotPasswordRequestBody {
  email: string;
}

export interface ResendOtpRequestBody {
  email: string;
}

export interface ResetPasswordRequestBody {
  email: string;
  otp: string;
  newPassword: string;
}

export interface UpdateProfileRequestBody {
  name: string;
  phoneNumber?: string;
  age: number;
  gender: Gender;
}

export interface JwtTokenPayload {
  userId: string;
  email: string;
  role: AuthRole;
}

export interface AuthenticatedUser {
  userId: ObjectId;
  email: string;
  role: AuthRole;
}

export interface PublicUserProfile {
  id: string;
  name: string;
  email: string;
  age?: number;
  gender?: Gender;
  accountStatus: string;
}
