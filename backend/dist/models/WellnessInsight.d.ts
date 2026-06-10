import { type Document, type Model, type Types } from "mongoose";
import { RecommendationPriority } from "../types/common.types.js";
export interface IWellnessInsight extends Document {
    student: Types.ObjectId;
    title: string;
    summary: string;
    priority: RecommendationPriority;
    insightType: "trend" | "risk_factor" | "protective_factor" | "milestone";
    relatedPrediction?: Types.ObjectId;
    relatedAssessment?: Types.ObjectId;
    relatedAssessmentModel?: "InitialAssessment" | "WeeklyAssessment";
    metadata: Record<string, unknown>;
    validFrom: Date;
    validUntil?: Date;
    acknowledgedAt?: Date;
    createdAt: Date;
    updatedAt: Date;
}
export declare const WellnessInsight: Model<IWellnessInsight>;
