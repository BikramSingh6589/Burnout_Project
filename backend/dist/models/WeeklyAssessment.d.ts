import { type Document, type Model, type Types } from "mongoose";
import { AssessmentStatus, RiskLevel } from "../types/common.types.js";
export interface IWeeklyAssessment extends Document {
    student: Types.ObjectId;
    weekStartDate: Date;
    academicLoadScore: number;
    stressScore: number;
    sleepHoursAverage: number;
    sleepQualityScore: number;
    moodScore: number;
    motivationScore: number;
    concentrationScore: number;
    physicalFatigueScore: number;
    burnoutScore: number;
    riskLevel: RiskLevel;
    responses: Record<string, unknown>;
    status: AssessmentStatus;
    completedAt?: Date;
    createdAt: Date;
    updatedAt: Date;
}
export declare const WeeklyAssessment: Model<IWeeklyAssessment>;
