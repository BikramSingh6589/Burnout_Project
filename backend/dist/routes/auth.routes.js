import { Router } from "express";
import { authenticateStudent, getAuthenticatedStudent, loginStudent, registerStudent, } from "../controllers/auth.controller.js";
const router = Router();
router.post("/register", registerStudent);
router.post("/login", loginStudent);
router.get("/me", authenticateStudent, getAuthenticatedStudent);
export default router;
//# sourceMappingURL=auth.routes.js.map