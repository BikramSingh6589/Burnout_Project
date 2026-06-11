import { Router } from "express";
import { authenticate } from "../middlewares/auth.middleware.js";
import { submitAssessment, getAssessmentHistory, getLatestAssessment } from "../controllers/assessment.controller.js";
import { validateAssessment } from "../validators/assessment.validation.js";

const router = Router();

router.post("/", authenticate, validateAssessment, submitAssessment);
router.get("/history", authenticate, getAssessmentHistory);
router.get("/latest", authenticate, getLatestAssessment);

export default router;
