import { type Document, type Model, type Types } from "mongoose";
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
export declare const InitialAssessment: Model<IInitialAssessment>;
