import { Router } from "express";
import { authenticate } from "../middlewares/auth.middleware.js";
import { submitInitialAssessment, getInitialAssessment } from "../controllers/initial-assessment.controller.js";
import { validateInitialAssessment } from "../validators/initial-assessment.validation.js";

const router = Router();

router.post("/", authenticate, validateInitialAssessment, submitInitialAssessment);
router.get("/", authenticate, getInitialAssessment);

export default router;
