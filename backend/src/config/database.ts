import mongoose from "mongoose";
import { config } from "./env.js";
import { WeeklyAssessment } from "../models/WeeklyAssessment.js";

const WEEKLY_ASSESSMENT_INDEX = "student_1_weekStartDate_-1";

const dropLegacyWeeklyAssessmentUniqueIndex = async (): Promise<void> => {
  try {
    const indexes = await WeeklyAssessment.collection.indexes();
    const weeklyIndex = indexes.find((index) => index.name === WEEKLY_ASSESSMENT_INDEX);

    if (weeklyIndex?.unique) {
      await WeeklyAssessment.collection.dropIndex(WEEKLY_ASSESSMENT_INDEX);
      await WeeklyAssessment.syncIndexes();
      console.log("Dropped legacy unique weekly assessment index");
    }
  } catch (error) {
    console.warn("Unable to verify weekly assessment indexes", error);
  }
};

export const connectDatabase = async (): Promise<void> => {
  mongoose.set("strictQuery", true);

  await mongoose.connect(config.mongoUri, {
    serverSelectionTimeoutMS: 10000,
  });

  console.log("MongoDB connected");
  await dropLegacyWeeklyAssessmentUniqueIndex();
};

export const disconnectDatabase = async (): Promise<void> => {
  await mongoose.disconnect();
};
