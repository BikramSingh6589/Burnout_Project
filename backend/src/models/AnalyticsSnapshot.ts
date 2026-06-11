import { Schema, model, type Document, type Model } from "mongoose";

export interface IAnalyticsMetrics {
  totalStudents: number;
  activeStudents: number;
  averageBurnoutScore: number;
  lowRiskCount: number;
  moderateRiskCount: number;
  highRiskCount: number;
  criticalRiskCount: number;
  assessmentsCompleted: number;
  recommendationsCompleted: number;
}

export interface IAnalyticsSnapshot extends Document {
  snapshotDate: Date;
  scope: "global" | "department" | "program";
  scopeValue?: string;
  metrics: IAnalyticsMetrics;
  generatedBy?: string;
  createdAt: Date;
  updatedAt: Date;
}

const AnalyticsMetricsSchema = new Schema<IAnalyticsMetrics>(
  {
    totalStudents: { type: Number, required: true, min: 0 },
    activeStudents: { type: Number, required: true, min: 0 },
    averageBurnoutScore: { type: Number, required: true, min: 0, max: 100 },
    lowRiskCount: { type: Number, required: true, min: 0 },
    moderateRiskCount: { type: Number, required: true, min: 0 },
    highRiskCount: { type: Number, required: true, min: 0 },
    criticalRiskCount: { type: Number, required: true, min: 0 },
    assessmentsCompleted: { type: Number, required: true, min: 0 },
    recommendationsCompleted: { type: Number, required: true, min: 0 },
  },
  { _id: false },
);

const AnalyticsSnapshotSchema = new Schema<IAnalyticsSnapshot>(
  {
    snapshotDate: {
      type: Date,
      required: true,
      index: true,
    },
    scope: {
      type: String,
      enum: ["global", "department", "program"],
      default: "global",
      index: true,
    },
    scopeValue: {
      type: String,
      trim: true,
      index: true,
    },
    metrics: {
      type: AnalyticsMetricsSchema,
      required: true,
    },
    generatedBy: {
      type: String,
      trim: true,
    },
  },
  { timestamps: true },
);

AnalyticsSnapshotSchema.index({ scope: 1, scopeValue: 1, snapshotDate: -1 }, { unique: true });

export const AnalyticsSnapshot: Model<IAnalyticsSnapshot> = model<IAnalyticsSnapshot>(
  "AnalyticsSnapshot",
  AnalyticsSnapshotSchema,
);
