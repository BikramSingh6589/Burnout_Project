import { Schema, model } from "mongoose";
import { RiskLevel } from "../types/common.types.js";
const BurnoutPredictionSchema = new Schema({
    student: {
        type: Schema.Types.ObjectId,
        ref: "Student",
        required: true,
        index: true,
    },
    featureExtraction: {
        type: Schema.Types.ObjectId,
        ref: "FeatureExtraction",
        required: true,
        index: true,
    },
    modelName: {
        type: String,
        required: true,
        trim: true,
    },
    modelVersion: {
        type: String,
        required: true,
        trim: true,
        index: true,
    },
    predictedScore: {
        type: Number,
        required: true,
        min: 0,
        max: 100,
        index: true,
    },
    predictedRiskLevel: {
        type: String,
        enum: Object.values(RiskLevel),
        required: true,
        index: true,
    },
    confidence: { type: Number, required: true, min: 0, max: 1 },
    contributingFactors: [{ type: String, trim: true }],
    predictionWindowDays: { type: Number, required: true, min: 1, max: 365, default: 7 },
    predictedAt: {
        type: Date,
        required: true,
        default: Date.now,
        index: true,
    },
}, { timestamps: true });
BurnoutPredictionSchema.index({ student: 1, predictedAt: -1 });
BurnoutPredictionSchema.index({ predictedRiskLevel: 1, predictedAt: -1 });
export const BurnoutPrediction = model("BurnoutPrediction", BurnoutPredictionSchema);
//# sourceMappingURL=BurnoutPrediction.js.map