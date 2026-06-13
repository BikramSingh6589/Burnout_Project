import { Router } from "express";
import { authenticate } from "../middlewares/auth.middleware.js";
import { chatWithAI, chatWithAIStream, getAIHistory } from "../controllers/ai.controller.js";

const router = Router();

router.post("/chat", authenticate, chatWithAI);
router.post("/chat/stream", authenticate, chatWithAIStream);
router.get("/history", authenticate, getAIHistory);

export default router;
