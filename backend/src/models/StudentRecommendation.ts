import { Schema, model, type Document, type Model, type Types } from "mongoose";
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

const StudentRecommendationSchema = new Schema<IStudentRecommendation>(
  {
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
  },
  { timestamps: true },
);

StudentRecommendationSchema.index({ student: 1, status: 1, dueDate: 1 });
StudentRecommendationSchema.index({ student: 1, recommendation: 1 }, { unique: true });

export const StudentRecommendation: Model<IStudentRecommendation> = model<IStudentRecommendation>(
  "StudentRecommendation",
  StudentRecommendationSchema,
);
