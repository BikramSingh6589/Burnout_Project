import { Schema, model, type Document, type Model, type Types } from "mongoose";

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

const RecommendationFeedbackSchema = new Schema<IRecommendationFeedback>(
  {
    student: {
      type: Schema.Types.ObjectId,
      ref: "Student",
      required: true,
      index: true,
    },
    studentRecommendation: {
      type: Schema.Types.ObjectId,
      ref: "StudentRecommendation",
      required: true,
      unique: true,
      index: true,
    },
    rating: {
      type: Number,
      required: true,
      min: 1,
      max: 5,
      index: true,
    },
    helpful: {
      type: Boolean,
      required: true,
      index: true,
    },
    comment: {
      type: String,
      trim: true,
      maxlength: 2500,
    },
    completedActionSteps: [{ type: String, trim: true }],
    submittedAt: {
      type: Date,
      default: Date.now,
      required: true,
      index: true,
    },
  },
  { timestamps: true },
);

RecommendationFeedbackSchema.index({ student: 1, submittedAt: -1 });
RecommendationFeedbackSchema.index({ helpful: 1, rating: -1 });

export const RecommendationFeedback: Model<IRecommendationFeedback> = model<IRecommendationFeedback>(
  "RecommendationFeedback",
  RecommendationFeedbackSchema,
);
