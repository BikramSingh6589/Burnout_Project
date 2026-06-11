import { Router } from "express";
import { authenticate } from "../middlewares/auth.middleware.js";
import { chatWithAI, getAIHistory } from "../controllers/ai.controller.js";

const router = Router();

router.post("/chat", authenticate, chatWithAI);
router.get("/history", authenticate, getAIHistory);

export default router;
