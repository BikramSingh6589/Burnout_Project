import { Schema, model } from "mongoose";
import { RecommendationPriority } from "../types/common.types.js";
const WellnessInsightSchema = new Schema({
    student: {
        type: Schema.Types.ObjectId,
        ref: "Student",
        required: true,
        index: true,
    },
    title: {
        type: String,
        required: true,
        trim: true,
        maxlength: 180,
    },
    summary: {
        type: String,
        required: true,
        trim: true,
        maxlength: 3000,
    },
    priority: {
        type: String,
        enum: Object.values(RecommendationPriority),
        default: RecommendationPriority.Medium,
        index: true,
    },
    insightType: {
        type: String,
        enum: ["trend", "risk_factor", "protective_factor", "milestone"],
        required: true,
        index: true,
    },
    relatedPrediction: {
        type: Schema.Types.ObjectId,
        ref: "BurnoutPrediction",
    },
    relatedAssessment: {
        type: Schema.Types.ObjectId,
        refPath: "relatedAssessmentModel",
    },
    relatedAssessmentModel: {
        type: String,
        enum: ["InitialAssessment", "WeeklyAssessment"],
    },
    metadata: {
        type: Schema.Types.Mixed,
        default: {},
    },
    validFrom: {
        type: Date,
        default: Date.now,
        required: true,
        index: true,
    },
    validUntil: { type: Date, index: true },
    acknowledgedAt: Date,
}, { timestamps: true });
WellnessInsightSchema.index({ student: 1, validFrom: -1 });
WellnessInsightSchema.index({ student: 1, acknowledgedAt: 1, priority: 1 });
export const WellnessInsight = model("WellnessInsight", WellnessInsightSchema);
//# sourceMappingURL=WellnessInsight.js.map