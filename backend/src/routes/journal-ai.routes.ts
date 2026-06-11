import { Router } from "express";
import { authenticate } from "../middlewares/auth.middleware.js";
import { validateCreateJournal } from "../validators/journal-ai.validation.js";
import { createJournalEntry, getJournalEntries, deleteJournalEntry, getBurnoutRisk } from "../controllers/journal-ai.controller.js";

const router = Router();

router.post("/", authenticate, validateCreateJournal, createJournalEntry);
router.get("/", authenticate, getJournalEntries);
router.get("/burnout-risk", authenticate, getBurnoutRisk);
router.delete("/:id", authenticate, deleteJournalEntry);

export default router;
