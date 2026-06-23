import { Router } from "express";
import {
  submitDailyAssessment,
  getDailyAssessmentHistory,
  getLatestDailyAssessment,
} from "../controllers/daily-assessment.controller.js";
import { authenticate } from "../middlewares/auth.middleware.js";
import { validateDailyAssessment } from "../validators/daily-assessment.validation.js";

const router = Router();

router.post("/", authenticate, validateDailyAssessment, submitDailyAssessment);
router.get("/history", authenticate, getDailyAssessmentHistory);
router.get("/latest", authenticate, getLatestDailyAssessment);

export default router;

