import { Router } from "express";
import { authenticate } from "../middlewares/auth.middleware.js";
import {
  getRecommendationHistoryHandler,
  getRecommendations,
  submitRecommendationFeedback,
  getPendingAiRecommendationsHandler,
  approveRecommendationHandler,
  editAndApproveRecommendationHandler,
  rejectRecommendationHandler,
  deleteRecommendationHandler,
} from "../controllers/recommendation.controller.js";

const router = Router();

// Student-facing routes
router.get("/", authenticate, getRecommendations);
router.get("/history", authenticate, getRecommendationHistoryHandler);
router.post("/:id/feedback", authenticate, submitRecommendationFeedback);
router.delete("/:id", authenticate, deleteRecommendationHandler);

// Admin / Counselor approval queue
router.get("/admin/pending", authenticate, getPendingAiRecommendationsHandler);
router.patch("/admin/:id/approve", authenticate, approveRecommendationHandler);
router.patch("/admin/:id/edit-approve", authenticate, editAndApproveRecommendationHandler);
router.delete("/admin/:id/reject", authenticate, rejectRecommendationHandler);

export default router;
