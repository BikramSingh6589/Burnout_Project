import { Router } from "express";
import { authenticate } from "../middlewares/auth.middleware.js";
import { getRecommendations, submitRecommendationFeedback } from "../controllers/recommendation.controller.js";

const router = Router();

router.get("/", authenticate, getRecommendations);
router.post("/:id/feedback", authenticate, submitRecommendationFeedback);

export default router;
