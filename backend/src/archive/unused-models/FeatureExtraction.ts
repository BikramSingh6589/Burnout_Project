import { Schema, model, type Document, type Model, type Types } from "mongoose";

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

const FeatureExtractionSchema = new Schema<IFeatureExtraction>(
  {
    student: {
      type: Schema.Types.ObjectId,
      ref: "Student",
      required: true,
      index: true,
    },
    sourceAssessment: {
      type: Schema.Types.ObjectId,
      refPath: "sourceAssessmentModel",
    },
    sourceAssessmentModel: {
      type: String,
      enum: ["InitialAssessment", "WeeklyAssessment"],
    },
    sourceJournal: {
      type: Schema.Types.ObjectId,
      ref: "MoodJournal",
    },
    featureVersion: {
      type: String,
      required: true,
      trim: true,
      index: true,
    },
    features: {
      type: Map,
      of: Schema.Types.Mixed,
      default: {},
    },
    vector: {
      type: [Number],
      default: [],
      validate: {
        validator: (value: number[]) => value.every((item) => Number.isFinite(item)),
        message: "Feature vector must contain only finite numbers",
      },
    },
    extractedAt: {
      type: Date,
      required: true,
      default: Date.now,
      index: true,
    },
  },
  { timestamps: true },
);

FeatureExtractionSchema.index({ student: 1, extractedAt: -1 });
FeatureExtractionSchema.index({ sourceAssessment: 1, sourceAssessmentModel: 1 }, { sparse: true });

export const FeatureExtraction: Model<IFeatureExtraction> = model<IFeatureExtraction>(
  "FeatureExtraction",
  FeatureExtractionSchema,
);
