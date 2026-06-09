import { Router } from "express";
import {
  authenticateStudent,
  forgotPassword,
  getAuthenticatedStudent,
  googleSignIn,
  loginStudent,
  registerStudent,
  resendOtp,
  resetPassword,
  verifyOtp,
} from "../controllers/auth.controller.js";

const router = Router();

router.post("/register", registerStudent);
router.post("/verify-otp", verifyOtp);
router.post("/resend-otp", resendOtp);
router.post("/login", loginStudent);
router.post("/google", googleSignIn);
router.post("/forgot-password", forgotPassword);
router.post("/reset-password", resetPassword);
router.get("/me", authenticateStudent, getAuthenticatedStudent);

export default router;
