import { Schema, model, type Document, type Model, type Types } from "mongoose";
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

const NotificationSchema = new Schema<INotification>(
  {
    student: {
      type: Schema.Types.ObjectId,
      ref: "Student",
      required: true,
      index: true,
    },
    type: {
      type: String,
      enum: Object.values(NotificationType),
      required: true,
      index: true,
    },
    channel: {
      type: String,
      enum: Object.values(NotificationChannel),
      required: true,
      index: true,
    },
    status: {
      type: String,
      enum: Object.values(NotificationStatus),
      default: NotificationStatus.Pending,
      index: true,
    },
    title: {
      type: String,
      required: true,
      trim: true,
      maxlength: 180,
    },
    message: {
      type: String,
      required: true,
      trim: true,
      maxlength: 5000,
    },
    metadata: {
      type: Schema.Types.Mixed,
      default: {},
    },
    scheduledFor: { type: Date, index: true },
    sentAt: Date,
    readAt: Date,
    failureReason: { type: String, trim: true },
  },
  { timestamps: true },
);

NotificationSchema.index({ student: 1, status: 1, createdAt: -1 });
NotificationSchema.index({ status: 1, scheduledFor: 1 });

export const Notification: Model<INotification> = model<INotification>("Notification", NotificationSchema);
