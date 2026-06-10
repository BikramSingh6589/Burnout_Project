import { Router } from "express";
import { authenticate } from "../middlewares/auth.middleware.js";
import { getAnalyticsSummary } from "../controllers/analytics.controller.js";

const router = Router();

router.get("/summary", authenticate, getAnalyticsSummary);

export default router;
