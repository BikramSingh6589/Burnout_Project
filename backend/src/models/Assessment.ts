import { Schema, model, type Document, type Model, type Types } from "mongoose";
import { AssessmentStatus, RiskLevel } from "../types/common.types.js";

export interface IAssessment extends Document {
  student: Types.ObjectId;
  stressLevel: number;
  academicSatisfaction: number;
  studyHours: number;
  backlog: number;
  procrastination: number;
  motivation: number;
  energy: number;
  sleepHours: number;
  screenTime: number;
  burnoutScore: number;
  burnoutScoreBreakdown: Record<string, number>;
  riskLevel: RiskLevel;
  riskDescription: string;
  responses: Record<string, number>;
  status: AssessmentStatus;
  completedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

const AssessmentSchema = new Schema<IAssessment>(
  {
    student: {
      type: Schema.Types.ObjectId,
      ref: "Student",
      required: true,
      index: true,
    },
    stressLevel: { type: Number, required: true, min: 0, max: 10 },
    academicSatisfaction: { type: Number, required: true, min: 0, max: 10 },
    studyHours: { type: Number, required: true, min: 0, max: 24 },
    backlog: { type: Number, required: true, min: 0, max: 10 },
    procrastination: { type: Number, required: true, min: 0, max: 10 },
    motivation: { type: Number, required: true, min: 0, max: 10 },
    energy: { type: Number, required: true, min: 0, max: 10 },
    sleepHours: { type: Number, required: true, min: 0, max: 24 },
    screenTime: { type: Number, required: true, min: 0, max: 24 },
    burnoutScore: { type: Number, required: true, min: 0, max: 100, index: true },
    burnoutScoreBreakdown: {
      type: Schema.Types.Mixed,
      required: true,
      default: {},
    },
    riskLevel: {
      type: String,
      enum: Object.values(RiskLevel),
      required: true,
      index: true,
    },
    riskDescription: { type: String, required: true, trim: true },
    responses: {
      type: Schema.Types.Mixed,
      required: true,
      default: {},
    },
    status: {
      type: String,
      enum: Object.values(AssessmentStatus),
      default: AssessmentStatus.Completed,
      index: true,
    },
    completedAt: Date,
  },
  {
    timestamps: true,
  },
);

AssessmentSchema.index({ student: 1, createdAt: -1 });
AssessmentSchema.index({ riskLevel: 1, completedAt: -1 });

export const Assessment: Model<IAssessment> = model<IAssessment>("Assessment", AssessmentSchema);
