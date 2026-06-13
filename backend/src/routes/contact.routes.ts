import { Router } from "express";
import { submitContact } from "../controllers/contact.controller.js";
import { validateContact } from "../validators/contact.validation.js";

const router = Router();

router.post("/", validateContact, submitContact);

export default router;
