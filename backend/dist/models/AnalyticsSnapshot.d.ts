import { type Document, type Model } from "mongoose";
export interface IAnalyticsMetrics {
    totalStudents: number;
    activeStudents: number;
    averageBurnoutScore: number;
    lowRiskCount: number;
    moderateRiskCount: number;
    highRiskCount: number;
    criticalRiskCount: number;
    assessmentsCompleted: number;
    recommendationsCompleted: number;
}
export interface IAnalyticsSnapshot extends Document {
    snapshotDate: Date;
    scope: "global" | "department" | "program";
    scopeValue?: string;
    metrics: IAnalyticsMetrics;
    generatedBy?: string;
    createdAt: Date;
    updatedAt: Date;
}
export declare const AnalyticsSnapshot: Model<IAnalyticsSnapshot>;
