import { Schema, model, type Document, type Model, type Types } from "mongoose";
import { AssessmentStatus, RiskLevel } from "../types/common.types.js";

export interface IWeeklyAssessment extends Document {
  student: Types.ObjectId;
  weekStartDate: Date;
  // Original weekly assessment fields
  academicLoadScore: number;
  stressScore: number;
  sleepHoursAverage: number;
  sleepQualityScore: number;
  moodScore: number;
  motivationScore: number;
  concentrationScore: number;
  physicalFatigueScore: number;
  // Additional fields from frontend form (matching Assessment model)
  stressLevel: number;
  academicSatisfaction: number;
  studyHours: number;
  backlog: number;
  procrastination: number;
  motivation: number;
  energy: number;
  sleepHours: number;
  screenTime: number;
  // Standard fields
  burnoutScore: number;
  burnoutScoreBreakdown: Record<string, number>;
  riskLevel: RiskLevel;
  responses: Record<string, unknown>;
  status: AssessmentStatus;
  completedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

const WeeklyAssessmentSchema = new Schema<IWeeklyAssessment>(
  {
    student: {
      type: Schema.Types.ObjectId,
      ref: "Student",
      required: true,
      index: true,
    },
    weekStartDate: {
      type: Date,
      required: true,
    },
    // Original weekly assessment fields
    academicLoadScore: { type: Number, required: true, min: 0, max: 100 },
    stressScore: { type: Number, required: true, min: 0, max: 100 },
    sleepHoursAverage: { type: Number, required: true, min: 0, max: 24 },
    sleepQualityScore: { type: Number, required: true, min: 0, max: 100 },
    moodScore: { type: Number, required: true, min: 0, max: 100 },
    motivationScore: { type: Number, required: true, min: 0, max: 100 },
    concentrationScore: { type: Number, required: true, min: 0, max: 100 },
    physicalFatigueScore: { type: Number, required: true, min: 0, max: 100 },
    // Additional fields from frontend form (matching Assessment model)
    stressLevel: { type: Number, required: true, min: 0, max: 10 },
    academicSatisfaction: { type: Number, required: true, min: 0, max: 10 },
    studyHours: { type: Number, required: true, min: 0, max: 24 },
    backlog: { type: Number, required: true, min: 0, max: 10 },
    procrastination: { type: Number, required: true, min: 0, max: 10 },
    motivation: { type: Number, required: true, min: 0, max: 10 },
    energy: { type: Number, required: true, min: 0, max: 10 },
    sleepHours: { type: Number, required: true, min: 0, max: 24 },
    screenTime: { type: Number, required: true, min: 0, max: 24 },
    // Standard fields
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

WeeklyAssessmentSchema.index({ student: 1, weekStartDate: -1 });
WeeklyAssessmentSchema.index({ riskLevel: 1, completedAt: -1 });

export const WeeklyAssessment: Model<IWeeklyAssessment> = model<IWeeklyAssessment>(
  "WeeklyAssessment",
  WeeklyAssessmentSchema,
);
