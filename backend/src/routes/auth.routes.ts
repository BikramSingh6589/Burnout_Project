import { Router } from "express";
import {
  forgotPassword,
  getAuthenticatedStudent,
  loginStudent,
  registerStudent,
  resetPassword,
  verifyOtp,
} from "../controllers/auth.controller.js";
import { authenticate } from "../middlewares/auth.middleware.js";
import {
  validateForgotPassword,
  validateLogin,
  validateRegister,
  validateResetPassword,
  validateVerifyOtp,
} from "../validators/auth.validation.js";

const router = Router();

router.post("/register", validateRegister, registerStudent);
router.post("/login", validateLogin, loginStudent);
router.post("/verify-otp", validateVerifyOtp, verifyOtp);
router.post("/forgot-password", validateForgotPassword, forgotPassword);
router.post("/reset-password", validateResetPassword, resetPassword);
router.get("/me", authenticate, getAuthenticatedStudent);

export default router;
