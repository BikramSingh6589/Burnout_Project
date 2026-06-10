import { type Document, type Model, type Types } from "mongoose";
import { NotificationChannel, NotificationStatus, NotificationType } from "../types/common.types.js";
export interface INotification extends Document {
    student: Types.ObjectId;
    type: NotificationType;
    channel: NotificationChannel;
    status: NotificationStatus;
    title: string;
    message: string;
    metadata: Record<string, unknown>;
    scheduledFor?: Date;
    sentAt?: Date;
    readAt?: Date;
    failureReason?: string;
    createdAt: Date;
    updatedAt: Date;
}
export declare const Notification: Model<INotification>;
