import type { NextFunction, Request, Response } from "express";
import { Notification } from "../models/Notification.js";
import { NotificationChannel, NotificationStatus, NotificationType } from "../types/common.types.js";
import { Types } from "mongoose";

const DEFAULT_NOTIFICATIONS = [
  {
    type: NotificationType.AssessmentReminder,
    channel: NotificationChannel.InApp,
    status: NotificationStatus.Sent,
    title: "Weekly Reassessment Due",
    message: "Your weekly reassessment is due. Please take 2 minutes to update your wellness profile.",
  },
  {
    type: NotificationType.RiskAlert,
    channel: NotificationChannel.InApp,
    status: NotificationStatus.Sent,
    title: "Burnout Risk Alert",
    message: "Risk Level Warning: Your burnout score has entered the High Risk zone. Consider scheduling a self-care break.",
  },
  {
    type: NotificationType.Recommendation,
    channel: NotificationChannel.InApp,
    status: NotificationStatus.Read,
    readAt: new Date(),
    title: "New Interventions Added",
    message: "New personalized recommendation added: 'Earlier Sleep Schedule'.",
  },
];

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
    let notifications = await Notification.find({
      student: new Types.ObjectId(userId),
    }).sort({ createdAt: -1 });

    if (notifications.length === 0) {
      for (const item of DEFAULT_NOTIFICATIONS) {
        const notif = new Notification({
          student: new Types.ObjectId(userId),
          ...item,
          sentAt: new Date(),
        });
        await notif.save();
      }
      notifications = await Notification.find({
        student: new Types.ObjectId(userId),
      }).sort({ createdAt: -1 });
    }

    const formatted = notifications.map((n) => {
      let category: "Assessment" | "Risk" | "Recommendation" | "Mood" | "General" = "General";
      if (n.type === NotificationType.AssessmentReminder) category = "Assessment";
      else if (n.type === NotificationType.RiskAlert) category = "Risk";
      else if (n.type === NotificationType.Recommendation) category = "Recommendation";

      return {
        id: n._id.toString(),
        category,
        message: n.message,
        read: n.status === NotificationStatus.Read,
        date: n.createdAt.toISOString().split("T")[0],
      };
    });

    res.status(200).json({
      success: true,
      data: formatted,
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

    await Notification.findOneAndUpdate(
      { _id: new Types.ObjectId(id), student: new Types.ObjectId(req.user.userId.toString()) },
      { status: NotificationStatus.Read, readAt: new Date() }
    );

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

    await Notification.updateMany(
      { student: new Types.ObjectId(req.user.userId.toString()), status: { $ne: NotificationStatus.Read } },
      { status: NotificationStatus.Read, readAt: new Date() }
    );

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

    await Notification.findOneAndDelete({
      _id: new Types.ObjectId(id),
      student: new Types.ObjectId(req.user.userId.toString()),
    });

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

    await Notification.deleteMany({
      student: new Types.ObjectId(req.user.userId.toString()),
    });

    res.status(200).json({ success: true, message: "All notifications deleted" });
  } catch (error) {
    next(error);
  }
};
