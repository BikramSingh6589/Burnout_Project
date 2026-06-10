import { Schema, model } from "mongoose";
import { RecommendationPriority, RecommendationStatus } from "../types/common.types.js";
const StudentRecommendationSchema = new Schema({
    student: {
        type: Schema.Types.ObjectId,
        ref: "Student",
        required: true,
        index: true,
    },
    recommendation: {
        type: Schema.Types.ObjectId,
        ref: "Recommendation",
        required: true,
        index: true,
    },
    prediction: {
        type: Schema.Types.ObjectId,
        ref: "BurnoutPrediction",
    },
    assignedBy: {
        type: Schema.Types.ObjectId,
        ref: "Admin",
    },
    priority: {
        type: String,
        enum: Object.values(RecommendationPriority),
        default: RecommendationPriority.Medium,
        index: true,
    },
    status: {
        type: String,
        enum: Object.values(RecommendationStatus),
        default: RecommendationStatus.Assigned,
        index: true,
    },
    personalizationReason: { type: String, trim: true, maxlength: 1000 },
    dueDate: { type: Date, index: true },
    startedAt: Date,
    completedAt: Date,
    dismissedAt: Date,
}, { timestamps: true });
StudentRecommendationSchema.index({ student: 1, status: 1, dueDate: 1 });
StudentRecommendationSchema.index({ student: 1, recommendation: 1 }, { unique: true });
export const StudentRecommendation = model("StudentRecommendation", StudentRecommendationSchema);
//# sourceMappingURL=StudentRecommendation.js.map