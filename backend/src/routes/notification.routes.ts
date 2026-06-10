import { Router } from "express";
import { authenticate } from "../middlewares/auth.middleware.js";
import {
  getNotifications,
  markRead,
  markAllRead,
  deleteNotification,
  deleteAllNotifications,
} from "../controllers/notification.controller.js";

const router = Router();

router.get("/", authenticate, getNotifications);
router.patch("/:id/read", authenticate, markRead);
router.post("/read-all", authenticate, markAllRead);
router.delete("/:id", authenticate, deleteNotification);
router.delete("/", authenticate, deleteAllNotifications);

export default router;
