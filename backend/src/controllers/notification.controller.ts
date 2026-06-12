import type { NextFunction, Request, Response } from "express";
import { NotificationService } from "../services/notification.service.js";
import { Types } from "mongoose";

export const getNotifications = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ success: false, message: "Unauthorized access" });
      return;
    }

    const userId = req.user.userId.toString();
    const { notifications, unreadCount } = await NotificationService.getStudentNotifications(userId);

    res.status(200).json({
      success: true,
      count: notifications.length,
      unreadCount,
      data: notifications,
    });
  } catch (error) {
    next(error);
  }
};

export const markRead = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ success: false, message: "Unauthorized access" });
      return;
    }

    const { id } = req.params;
    if (!Types.ObjectId.isValid(id)) {
      res.status(400).json({ success: false, message: "Invalid notification ID" });
      return;
    }

    const updated = await NotificationService.markAsRead(id, req.user.userId.toString());
    if (!updated) {
      res.status(404).json({ success: false, message: "Notification not found" });
      return;
    }

    res.status(200).json({ success: true, message: "Notification marked read" });
  } catch (error) {
    next(error);
  }
};

export const markAllRead = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ success: false, message: "Unauthorized access" });
      return;
    }

    await NotificationService.markAllAsRead(req.user.userId.toString());

    res.status(200).json({ success: true, message: "All notifications marked read" });
  } catch (error) {
    next(error);
  }
};

export const deleteNotification = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ success: false, message: "Unauthorized access" });
      return;
    }

    const { id } = req.params;
    if (!Types.ObjectId.isValid(id)) {
      res.status(400).json({ success: false, message: "Invalid notification ID" });
      return;
    }

    const deleted = await NotificationService.deleteNotification(id, req.user.userId.toString());
    if (!deleted) {
      res.status(404).json({ success: false, message: "Notification not found" });
      return;
    }

    res.status(200).json({ success: true, message: "Notification deleted" });
  } catch (error) {
    next(error);
  }
};

export const deleteAllNotifications = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ success: false, message: "Unauthorized access" });
      return;
    }

    await NotificationService.deleteAllNotifications(req.user.userId.toString());

    res.status(200).json({ success: true, message: "All notifications deleted" });
  } catch (error) {
    next(error);
  }
};
