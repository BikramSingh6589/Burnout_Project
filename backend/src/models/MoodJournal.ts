import { Schema, model, type Document, type Model, type Types } from "mongoose";
import { Mood } from "../types/common.types.js";

export interface IMoodJournal extends Document {
  student: Types.ObjectId;
  mood: Mood;
  moodScore: number;
  energyLevel: number;
  stressLevel: number;
  sleepHours?: number;
  notes?: string;
  tags: string[];
  sentimentScore?: number;
  journaledAt: Date;
  createdAt: Date;
  updatedAt: Date;
}

const MoodJournalSchema = new Schema<IMoodJournal>(
  {
    student: {
      type: Schema.Types.ObjectId,
      ref: "Student",
      required: true,
      index: true,
    },
    mood: {
      type: String,
      enum: Object.values(Mood),
      required: true,
      index: true,
    },
    moodScore: { type: Number, required: true, min: 0, max: 100 },
    energyLevel: { type: Number, required: true, min: 0, max: 100 },
    stressLevel: { type: Number, required: true, min: 0, max: 100, index: true },
    sleepHours: { type: Number, min: 0, max: 24 },
    notes: { type: String, trim: true, maxlength: 5000 },
    tags: [{ type: String, trim: true, lowercase: true }],
    sentimentScore: { type: Number, min: -1, max: 1 },
    journaledAt: {
      type: Date,
      required: true,
      default: Date.now,
      index: true,
    },
  },
  { timestamps: true },
);

MoodJournalSchema.index({ student: 1, journaledAt: -1 });
MoodJournalSchema.index({ student: 1, tags: 1 });

export const MoodJournal: Model<IMoodJournal> = model<IMoodJournal>("MoodJournal", MoodJournalSchema);
