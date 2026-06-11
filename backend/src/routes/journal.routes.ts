import { Router } from "express";
import { authenticate } from "../middlewares/auth.middleware.js";
import { getJournalEntries, createJournalEntry, deleteJournalEntry } from "../controllers/journal.controller.js";

const router = Router();

router.get("/", authenticate, getJournalEntries);
router.post("/", authenticate, createJournalEntry);
router.delete("/:id", authenticate, deleteJournalEntry);

export default router;
