import { type Document, type Model, type Types } from "mongoose";
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
export declare const MoodJournal: Model<IMoodJournal>;
