import { Schema, model } from "mongoose";
const AnalyticsMetricsSchema = new Schema({
    totalStudents: { type: Number, required: true, min: 0 },
    activeStudents: { type: Number, required: true, min: 0 },
    averageBurnoutScore: { type: Number, required: true, min: 0, max: 100 },
    lowRiskCount: { type: Number, required: true, min: 0 },
    moderateRiskCount: { type: Number, required: true, min: 0 },
    highRiskCount: { type: Number, required: true, min: 0 },
    criticalRiskCount: { type: Number, required: true, min: 0 },
    assessmentsCompleted: { type: Number, required: true, min: 0 },
    recommendationsCompleted: { type: Number, required: true, min: 0 },
}, { _id: false });
const AnalyticsSnapshotSchema = new Schema({
    snapshotDate: {
        type: Date,
        required: true,
        index: true,
    },
    scope: {
        type: String,
        enum: ["global", "department", "program"],
        default: "global",
        index: true,
    },
    scopeValue: {
        type: String,
        trim: true,
        index: true,
    },
    metrics: {
        type: AnalyticsMetricsSchema,
        required: true,
    },
    generatedBy: {
        type: String,
        trim: true,
    },
}, { timestamps: true });
AnalyticsSnapshotSchema.index({ scope: 1, scopeValue: 1, snapshotDate: -1 }, { unique: true });
export const AnalyticsSnapshot = model("AnalyticsSnapshot", AnalyticsSnapshotSchema);
//# sourceMappingURL=AnalyticsSnapshot.js.map