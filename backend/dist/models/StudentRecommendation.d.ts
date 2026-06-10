import { type Document, type Model, type Types } from "mongoose";
import { RecommendationPriority, RecommendationStatus } from "../types/common.types.js";
export interface IStudentRecommendation extends Document {
    student: Types.ObjectId;
    recommendation: Types.ObjectId;
    prediction?: Types.ObjectId;
    assignedBy?: Types.ObjectId;
    priority: RecommendationPriority;
    status: RecommendationStatus;
    personalizationReason?: string;
    dueDate?: Date;
    startedAt?: Date;
    completedAt?: Date;
    dismissedAt?: Date;
    createdAt: Date;
    updatedAt: Date;
}
export declare const StudentRecommendation: Model<IStudentRecommendation>;
