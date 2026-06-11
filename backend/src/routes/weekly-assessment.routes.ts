import { Router } from "express";
import { authenticate } from "../middlewares/auth.middleware.js";
import { submitWeeklyAssessment, getWeeklyAssessmentHistory, getLatestWeeklyAssessment } from "../controllers/weekly-assessment.controller.js";
import { validateWeeklyAssessment } from "../validators/weekly-assessment.validation.js";

const router = Router();

router.post("/", authenticate, validateWeeklyAssessment, submitWeeklyAssessment);
router.get("/history", authenticate, getWeeklyAssessmentHistory);
router.get("/latest", authenticate, getLatestWeeklyAssessment);

export default router;
