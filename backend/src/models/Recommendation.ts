import { Schema, model, type Document, type Model, type Types } from "mongoose";
import { RECOMMENDATION_CATEGORIES, RECOMMENDATION_PRIORITIES } from "../services/recommendation/recommendation.constants.js";
import type { RecommendationCategory, RecommendationPriority } from "../services/recommendation/recommendation.types.js";

export interface IRecommendation extends Document {
  userId: Types.ObjectId;
  assessmentId: Types.ObjectId;
  category: RecommendationCategory;
  priority: RecommendationPriority;
  title: string;
  message: string;
  source: "AI" | "rules";
  approved: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const RecommendationSchema = new Schema<IRecommendation>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: "Student",
      required: true,
      index: true,
    },
    assessmentId: {
      type: Schema.Types.ObjectId,
      ref: "Assessment",
      required: true,
      index: true,
    },
    category: {
      type: String,
      enum: RECOMMENDATION_CATEGORIES,
      required: true,
      index: true,
    },
    priority: {
      type: String,
      enum: RECOMMENDATION_PRIORITIES,
      required: true,
      default: "medium",
      index: true,
    },
    title: {
      type: String,
      required: true,
      trim: true,
      maxlength: 180,
    },
    message: {
      type: String,
      required: true,
      trim: true,
      maxlength: 1000,
    },
    source: {
      type: String,
      enum: ["AI", "rules"],
      default: "rules",
      required: true,
      index: true,
    },
    approved: {
      type: Boolean,
      default: true,
      required: true,
      index: true,
    },
  },
  { timestamps: true },
);

RecommendationSchema.index({ userId: 1, assessmentId: 1, category: 1, title: 1 }, { unique: true });
RecommendationSchema.index({ userId: 1, createdAt: -1 });
RecommendationSchema.index({ userId: 1, assessmentId: 1, priority: 1, createdAt: -1 });
RecommendationSchema.index({ approved: 1, createdAt: -1 });

export const Recommendation: Model<IRecommendation> = model<IRecommendation>("Recommendation", RecommendationSchema);
