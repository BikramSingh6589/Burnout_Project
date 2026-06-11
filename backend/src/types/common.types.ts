import type { Types } from "mongoose";

export type ObjectId = Types.ObjectId;

export enum AuthProvider {
  Local = "local",
  Google = "google",
}

export enum Gender {
  Male = "male",
  Female = "female",
  NonBinary = "non_binary",
  PreferNotToSay = "prefer_not_to_say",
  Other = "other",
}

export enum AccountStatus {
  Active = "active",
  Inactive = "inactive",
  Suspended = "suspended",
  PendingVerification = "pending_verification",
}

export enum RiskLevel {
  Low = "low",
  Moderate = "moderate",
  High = "high",
  Critical = "critical",
}

export enum AssessmentStatus {
  Draft = "draft",
  Completed = "completed",
  Reviewed = "reviewed",
}

export enum Mood {
  VeryLow = "very_low",
  Low = "low",
  Neutral = "neutral",
  Good = "good",
  Excellent = "excellent",
}

export enum ConversationRole {
  Student = "student",
  Assistant = "assistant",
  System = "system",
}

export enum RecommendationCategory {
  Sleep = "sleep",
  StudyHabits = "study_habits",
  Mindfulness = "mindfulness",
  Counseling = "counseling",
  Exercise = "exercise",
  SocialSupport = "social_support",
  TimeManagement = "time_management",
  CrisisSupport = "crisis_support",
}

export enum RecommendationPriority {
  Low = "low",
  Medium = "medium",
  High = "high",
  Urgent = "urgent",
}

export enum RecommendationStatus {
  Assigned = "assigned",
  InProgress = "in_progress",
  Completed = "completed",
  Dismissed = "dismissed",
}

export enum NotificationType {
  AssessmentReminder = "assessment_reminder",
  RiskAlert = "risk_alert",
  Recommendation = "recommendation",
  System = "system",
}

export enum NotificationChannel {
  Email = "email",
  Sms = "sms",
  Push = "push",
  InApp = "in_app",
}

export enum NotificationStatus {
  Pending = "pending",
  Sent = "sent",
  Read = "read",
  Failed = "failed",
}

export enum AdminRole {
  SuperAdmin = "super_admin",
  Counselor = "counselor",
  Faculty = "faculty",
  Analyst = "analyst",
}
