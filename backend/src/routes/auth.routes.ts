import { Router } from "express";
import {
  forgotPassword,
  getAuthenticatedStudent,
  googleLoginStudent,
  loginStudent,
  refreshToken,
  registerStudent,
  resendOtp,
  resetPassword,
  updateAuthenticatedStudent,
  verifyOtp,
} from "../controllers/auth.controller.js";
import { authenticate } from "../middlewares/auth.middleware.js";
import {
  validateForgotPassword,
  validateGoogleLogin,
  validateLogin,
  validateRegister,
  validateResendOtp,
  validateResetPassword,
  validateUpdateProfile,
  validateVerifyOtp,
} from "../validators/auth.validation.js";

const router = Router();

router.post("/register", validateRegister, registerStudent);
router.post("/login", validateLogin, loginStudent);
router.post("/google", validateGoogleLogin, googleLoginStudent);
router.post("/refresh-token", refreshToken);
router.post("/verify-otp", validateVerifyOtp, verifyOtp);
router.post("/resend-otp", validateResendOtp, resendOtp);
router.post("/forgot-password", validateForgotPassword, forgotPassword);
router.post("/reset-password", validateResetPassword, resetPassword);
router.get("/me", authenticate, getAuthenticatedStudent);
router.patch("/me", authenticate, validateUpdateProfile, updateAuthenticatedStudent);

export default router;
