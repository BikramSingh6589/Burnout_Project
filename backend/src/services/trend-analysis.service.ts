import { Types } from "mongoose";
import { Student } from "../models/Student.js";
import { Assessment } from "../models/Assessment.js";
import { WeeklyAssessment } from "../models/WeeklyAssessment.js";
import { NotificationService } from "./notification.service.js";
import { AccountStatus } from "../types/common.types.js";

export const analyzeBurnoutTrend = async (
  studentId: string | Types.ObjectId
): Promise<{ shouldAlert: boolean; currentScore?: number; previousScore?: number }> => {
  const studentObjectId = new Types.ObjectId(studentId);

  // Fetch initial/generic assessments
  const initialDocs = await Assessment.find({
    student: studentObjectId,
    status: "completed",
  }).lean();

  // Fetch weekly assessments
  const weeklyDocs = await WeeklyAssessment.find({
    student: studentObjectId,
    status: "completed",
  }).lean();

  // Combine and sort descending (newest first)
  const allAssessments = [
    ...initialDocs.map((d) => ({
      score: d.burnoutScore,
      date: d.completedAt || d.createdAt,
    })),
    ...weeklyDocs.map((d) => ({
      score: d.burnoutScore,
      date: d.completedAt || d.createdAt,
    })),
  ].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  if (allAssessments.length < 2) {
    return { shouldAlert: false };
  }

  const currentScore = allAssessments[0].score;
  const previousScore = allAssessments[1].score;

  const increase = currentScore - previousScore;
  const shouldAlert = currentScore > previousScore && increase >= 15;

  return {
    shouldAlert,
    currentScore,
    previousScore,
  };
};

export const generateRiskAlerts = async (): Promise<void> => {
  // Fetch active students
  const activeStudents = await Student.find({ accountStatus: AccountStatus.Active }).lean();

  for (const student of activeStudents) {
    try {
      const { shouldAlert, currentScore, previousScore } = await analyzeBurnoutTrend(student._id);
      if (shouldAlert) {
        await NotificationService.createRiskAlert(student._id, {
          currentScore,
          previousScore,
          difference: (currentScore ?? 0) - (previousScore ?? 0),
        });
      }
    } catch (error) {
      console.error(`[Trend Analysis] Error generating risk alert for student ${student._id}:`, error);
    }
  }
};

export const TrendAnalysisService = {
  analyzeBurnoutTrend,
  generateRiskAlerts,
};
