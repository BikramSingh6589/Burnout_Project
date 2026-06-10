import { Schema, model, type Document, type Model } from "mongoose";

export interface ISettings extends Document {
  highRiskThreshold: number;
  moderateRiskThreshold: number;
  assessmentIntervalDays: number;
  maxWeeklyAssessmentsPerStudent: number;
  emailNotificationsEnabled: boolean;
  inAppNotificationsEnabled: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const SettingsSchema = new Schema<ISettings>(
  {
    highRiskThreshold: {
      type: Number,
      default: 70,
      min: 0,
      max: 100,
    },
    moderateRiskThreshold: {
      type: Number,
      default: 40,
      min: 0,
      max: 100,
    },
    assessmentIntervalDays: {
      type: Number,
      default: 7,
      min: 1,
    },
    maxWeeklyAssessmentsPerStudent: {
      type: Number,
      default: 1,
      min: 1,
    },
    emailNotificationsEnabled: {
      type: Boolean,
      default: true,
    },
    inAppNotificationsEnabled: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  }
);

export const Settings: Model<ISettings> = model<ISettings>("Settings", SettingsSchema);
