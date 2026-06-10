import { type Document, type Model, type Types } from "mongoose";
import { RiskLevel } from "../types/common.types.js";
export interface IBurnoutPrediction extends Document {
    student: Types.ObjectId;
    featureExtraction: Types.ObjectId;
    modelName: string;
    modelVersion: string;
    predictedScore: number;
    predictedRiskLevel: RiskLevel;
    confidence: number;
    contributingFactors: string[];
    predictionWindowDays: number;
    predictedAt: Date;
    createdAt: Date;
    updatedAt: Date;
}
export declare const BurnoutPrediction: Model<IBurnoutPrediction>;
