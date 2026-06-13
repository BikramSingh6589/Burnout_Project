import { Router } from "express";
import {
  loginAdmin,
  getDashboard,
  getStudents,
  getHighRiskStudents,
  getStudentDetail,
  sendWellnessEmail,
} from "../controllers/admin.controller.js";
import { authenticateAdmin } from "../middlewares/admin.middleware.js";

const router = Router();

router.post("/login", loginAdmin);

// Protected routes - require admin authentication
router.get("/dashboard", authenticateAdmin, getDashboard);
router.get("/students", authenticateAdmin, getStudents);
router.get("/high-risk", authenticateAdmin, getHighRiskStudents);
router.get("/student/:studentId", authenticateAdmin, getStudentDetail);
router.post("/send-email", authenticateAdmin, sendWellnessEmail);

export default router;
