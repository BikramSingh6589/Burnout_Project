import { type Document, type Model, type Types } from "mongoose";
export interface IRecommendationFeedback extends Document {
    student: Types.ObjectId;
    studentRecommendation: Types.ObjectId;
    rating: number;
    helpful: boolean;
    comment?: string;
    completedActionSteps: string[];
    submittedAt: Date;
    createdAt: Date;
    updatedAt: Date;
}
export declare const RecommendationFeedback: Model<IRecommendationFeedback>;
