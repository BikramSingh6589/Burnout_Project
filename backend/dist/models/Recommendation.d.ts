import { type Document, type Model } from "mongoose";
import { RecommendationCategory, RecommendationPriority, RiskLevel } from "../types/common.types.js";
export interface IRecommendation extends Document {
    title: string;
    description: string;
    category: RecommendationCategory;
    priority: RecommendationPriority;
    targetRiskLevels: RiskLevel[];
    actionSteps: string[];
    estimatedDurationMinutes?: number;
    resourceUrl?: string;
    isActive: boolean;
    createdAt: Date;
    updatedAt: Date;
}
export declare const Recommendation: Model<IRecommendation>;
