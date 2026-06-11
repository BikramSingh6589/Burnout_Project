import { Schema, model, type Document, type Model, type Types } from "mongoose";
import { AssessmentStatus, RiskLevel } from "../types/common.types.js";

export interface IInitialAssessment extends Document {
  student: Types.ObjectId;
  academicPressureScore: number;
  sleepQualityScore: number;
  emotionalExhaustionScore: number;
  cynicismScore: number;
  efficacyScore: number;
  socialSupportScore: number;
  financialStressScore: number;
  baselineBurnoutScore: number;
  baselineRiskLevel: RiskLevel;
  responses: Record<string, unknown>;
  status: AssessmentStatus;
  completedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

const InitialAssessmentSchema = new Schema<IInitialAssessment>(
  {
    student: {
      type: Schema.Types.ObjectId,
      ref: "Student",
      required: true,
      index: true,
    },
    academicPressureScore: { type: Number, required: true, min: 0, max: 100 },
    sleepQualityScore: { type: Number, required: true, min: 0, max: 100 },
    emotionalExhaustionScore: { type: Number, required: true, min: 0, max: 100 },
    cynicismScore: { type: Number, required: true, min: 0, max: 100 },
    efficacyScore: { type: Number, required: true, min: 0, max: 100 },
    socialSupportScore: { type: Number, required: true, min: 0, max: 100 },
    financialStressScore: { type: Number, required: true, min: 0, max: 100 },
    baselineBurnoutScore: { type: Number, required: true, min: 0, max: 100, index: true },
    baselineRiskLevel: {
      type: String,
      enum: Object.values(RiskLevel),
      required: true,
      index: true,
    },
    responses: {
      type: Schema.Types.Mixed,
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
  { timestamps: true },
);

InitialAssessmentSchema.index({ student: 1, createdAt: -1 });
InitialAssessmentSchema.index({ baselineRiskLevel: 1, completedAt: -1 });

export const InitialAssessment: Model<IInitialAssessment> = model<IInitialAssessment>(
  "InitialAssessment",
  InitialAssessmentSchema,
);
