import { Schema, model, type Document, type Model, type Types } from "mongoose";

export type Sentiment = "positive" | "negative" | "neutral";

export interface IJournal extends Document {
  studentId: Types.ObjectId;
  content: string;
  sentiment: Sentiment;
  createdAt: Date;
  updatedAt: Date;
}

const JournalSchema = new Schema<IJournal>(
  {
    studentId: {
      type: Schema.Types.ObjectId,
      ref: "Student",
      required: true,
      index: true,
    },
    content: {
      type: String,
      required: true,
      trim: true,
      minlength: 10,
      maxlength: 2000,
    },
    sentiment: {
      type: String,
      enum: ["positive", "negative", "neutral"],
      required: true,
      index: true,
    },
  },
  {
    timestamps: true,
  },
);

JournalSchema.index({ studentId: 1, createdAt: -1 });

export const Journal: Model<IJournal> = model<IJournal>("Journal", JournalSchema);
