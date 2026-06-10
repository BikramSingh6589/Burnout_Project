import { Schema, model } from "mongoose";
import { AssessmentStatus, RiskLevel } from "../types/common.types.js";
const InitialAssessmentSchema = new Schema({
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
}, { timestamps: true });
InitialAssessmentSchema.index({ student: 1, createdAt: -1 });
InitialAssessmentSchema.index({ baselineRiskLevel: 1, completedAt: -1 });
export const InitialAssessment = model("InitialAssessment", InitialAssessmentSchema);
//# sourceMappingURL=InitialAssessment.js.map