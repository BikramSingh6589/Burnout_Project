import { type Document, type Model, type Types } from "mongoose";
export interface IFeatureExtraction extends Document {
    student: Types.ObjectId;
    sourceAssessment?: Types.ObjectId;
    sourceAssessmentModel?: "InitialAssessment" | "WeeklyAssessment";
    sourceJournal?: Types.ObjectId;
    featureVersion: string;
    features: Record<string, number | string | boolean | null>;
    vector: number[];
    extractedAt: Date;
    createdAt: Date;
    updatedAt: Date;
}
export declare const FeatureExtraction: Model<IFeatureExtraction>;
