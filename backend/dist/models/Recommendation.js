import { Schema, model } from "mongoose";
import { RecommendationCategory, RecommendationPriority, RiskLevel } from "../types/common.types.js";
const RecommendationSchema = new Schema({
    title: {
        type: String,
        required: true,
        trim: true,
        maxlength: 180,
    },
    description: {
        type: String,
        required: true,
        trim: true,
        maxlength: 5000,
    },
    category: {
        type: String,
        enum: Object.values(RecommendationCategory),
        required: true,
        index: true,
    },
    priority: {
        type: String,
        enum: Object.values(RecommendationPriority),
        default: RecommendationPriority.Medium,
        index: true,
    },
    targetRiskLevels: [{
            type: String,
            enum: Object.values(RiskLevel),
            required: true,
        }],
    actionSteps: [{ type: String, trim: true }],
    estimatedDurationMinutes: { type: Number, min: 1, max: 1440 },
    resourceUrl: { type: String, trim: true },
    isActive: {
        type: Boolean,
        default: true,
        index: true,
    },
}, { timestamps: true });
RecommendationSchema.index({ category: 1, priority: 1, isActive: 1 });
RecommendationSchema.index({ targetRiskLevels: 1, isActive: 1 });
export const Recommendation = model("Recommendation", RecommendationSchema);
//# sourceMappingURL=Recommendation.js.map