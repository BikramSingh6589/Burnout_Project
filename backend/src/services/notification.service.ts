import { Types } from "mongoose";
import { Notification, type INotification } from "../models/Notification.js";
import { NotificationType, NotificationChannel, NotificationStatus } from "../types/common.types.js";
import { AppError } from "../middlewares/error.middleware.js";

export const notificationAlreadyExistsToday = async (
  studentId: string | Types.ObjectId,
  type: NotificationType
): Promise<boolean> => {
  const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
  const count = await Notification.countDocuments({
    student: new Types.ObjectId(studentId),
    type,
    createdAt: { $gte: oneDayAgo },
  });
  return count > 0;
};

export const createNotification = async (data: {
  student: string | Types.ObjectId;
  type: string;
  title: string;
  message: string;
  channel?: NotificationChannel;
  status?: NotificationStatus;
  metadata?: Record<string, unknown>;
}): Promise<INotification> => {
  const { student, type, title, message, channel, status, metadata } = data;

  // 1. Validation - Required fields
  if (!student || !type || !title || !message) {
    throw new AppError("Missing required notification fields", 400);
  }

  // 2. Validation - Valid notification type
  if (!Object.values(NotificationType).includes(type as any)) {
    throw new AppError("Invalid notification type", 400);
  }

  const notification = new Notification({
    student: new Types.ObjectId(student),
    type: type as NotificationType,
    title: title.trim(),
    message: message.trim(),
    channel: channel || NotificationChannel.InApp,
    status: status || NotificationStatus.Sent,
    isRead: false,
    metadata: metadata || {},
  });

  return await notification.save();
};

export const createAssessmentReminder = async (
  studentId: string | Types.ObjectId
): Promise<INotification | null> => {
  // Prevent duplicate within 24 hours
  const exists = await notificationAlreadyExistsToday(studentId, NotificationType.AssessmentReminder);
  if (exists) {
    return null;
  }

  return await createNotification({
    student: studentId,
    type: NotificationType.AssessmentReminder,
    title: "Weekly Assessment Reminder",
    message: "Please complete your weekly burnout assessment.",
    channel: NotificationChannel.InApp,
    status: NotificationStatus.Sent,
  });
};

export const createRiskAlert = async (
  studentId: string | Types.ObjectId,
  metadata?: Record<string, unknown>
): Promise<INotification | null> => {
  // Prevent duplicate within 24 hours
  const exists = await notificationAlreadyExistsToday(studentId, NotificationType.RiskAlert);
  if (exists) {
    return null;
  }

  return await createNotification({
    student: studentId,
    type: NotificationType.RiskAlert,
    title: "Burnout Risk Alert",
    message: "Your burnout risk has increased significantly. Please review recommendations immediately.",
    channel: NotificationChannel.InApp,
    status: NotificationStatus.Sent,
    metadata,
  });
};

export const createRecommendationNotification = async (
  studentId: string | Types.ObjectId,
  metadata?: Record<string, unknown>
): Promise<INotification> => {
  return await createNotification({
    student: studentId,
    type: NotificationType.Recommendation,
    title: "Recommendation Update",
    message: "New wellness recommendations are available for you.",
    channel: NotificationChannel.InApp,
    status: NotificationStatus.Sent,
    metadata,
  });
};

export const createAIAlert = async (
  studentId: string | Types.ObjectId,
  metadata?: Record<string, unknown>
): Promise<INotification | null> => {
  // Prevent duplicate within 24 hours
  const exists = await notificationAlreadyExistsToday(studentId, NotificationType.AIAlert);
  if (exists) {
    return null;
  }

  return await createNotification({
    student: studentId,
    type: NotificationType.AIAlert,
    title: "AI Wellness Alert",
    message: "Your recent conversation indicates elevated stress levels. Consider reviewing your wellness recommendations.",
    channel: NotificationChannel.InApp,
    status: NotificationStatus.Sent,
    metadata,
  });
};

export const getStudentNotifications = async (
  studentId: string | Types.ObjectId
): Promise<{ notifications: INotification[]; unreadCount: number }> => {
  const studentObjectId = new Types.ObjectId(studentId);

  const notifications = await Notification.find({ student: studentObjectId })
    .sort({ createdAt: -1 })
    .lean() as unknown as INotification[];

  const unreadCount = await Notification.countDocuments({
    student: studentObjectId,
    isRead: false,
  });

  return {
    notifications,
    unreadCount,
  };
};

export const markAsRead = async (
  notificationId: string | Types.ObjectId,
  studentId: string | Types.ObjectId
): Promise<INotification | null> => {
  return await Notification.findOneAndUpdate(
    {
      _id: new Types.ObjectId(notificationId),
      student: new Types.ObjectId(studentId),
    },
    {
      $set: {
        isRead: true,
        status: NotificationStatus.Read,
        readAt: new Date(),
      },
    },
    { new: true }
  );
};

export const markAllAsRead = async (
  studentId: string | Types.ObjectId
): Promise<any> => {
  return await Notification.updateMany(
    {
      student: new Types.ObjectId(studentId),
      isRead: false,
    },
    {
      $set: {
        isRead: true,
        status: NotificationStatus.Read,
        readAt: new Date(),
      },
    }
  );
};

export const deleteNotification = async (
  notificationId: string | Types.ObjectId,
  studentId: string | Types.ObjectId
): Promise<INotification | null> => {
  return await Notification.findOneAndDelete({
    _id: new Types.ObjectId(notificationId),
    student: new Types.ObjectId(studentId),
  });
};

export const deleteAllNotifications = async (
  studentId: string | Types.ObjectId
): Promise<any> => {
  return await Notification.deleteMany({
    student: new Types.ObjectId(studentId),
  });
};

export const NotificationService = {
  createNotification,
  createAssessmentReminder,
  createRiskAlert,
  createRecommendationNotification,
  createAIAlert,
  getStudentNotifications,
  markAsRead,
  markAllAsRead,
  deleteNotification,
  deleteAllNotifications,
  notificationAlreadyExistsToday,
};
