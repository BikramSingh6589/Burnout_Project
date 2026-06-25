import { Router } from "express";
import {
  loginAdmin,
  getDashboard,
  getStudents,
  getHighRiskStudents,
  getStudentDetail,
  sendWellnessEmail,
  sendBulkWellnessEmail,
  triggerWeeklyReminderJob,
  sendJustLoggedInReminders,
  sendOnlyInitialReminders,
  sendStreakMaintainerReminders,
} from "../controllers/admin.controller.js";
import { authenticateAdmin } from "../middlewares/admin.middleware.js";
import { validateAdminLogin } from "../validators/admin.validation.js";

const router = Router();

router.post("/login", validateAdminLogin, loginAdmin);

// Protected routes - require admin authentication
router.get("/dashboard", authenticateAdmin, getDashboard);
router.get("/students", authenticateAdmin, getStudents);
router.get("/high-risk", authenticateAdmin, getHighRiskStudents);
router.get("/student/:studentId", authenticateAdmin, getStudentDetail);
router.post("/send-email", authenticateAdmin, sendWellnessEmail);
router.post("/send-bulk-email", authenticateAdmin, sendBulkWellnessEmail);
router.post("/trigger-reminder-job", authenticateAdmin, triggerWeeklyReminderJob);

// Assessment reminder endpoints
router.post("/send-reminders/just-logged-in", authenticateAdmin, sendJustLoggedInReminders);
router.post("/send-reminders/only-initial", authenticateAdmin, sendOnlyInitialReminders);
router.post("/send-reminders/active-streak", authenticateAdmin, sendStreakMaintainerReminders);

export default router;
