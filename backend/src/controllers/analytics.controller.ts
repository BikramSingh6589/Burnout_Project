import type { NextFunction, Request, Response } from "express";
import { getAssessmentHistory } from "../services/assessment/assessment.service.js";
import { summarizeHistoricalAnalytics } from "../services/burnout/trend-analysis.service.js";
import { Student } from "../models/Student.js";
import type { BurnoutHistoryItem } from "../types/burnout.types.js";

export const getAnalyticsSummary = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ success: false, message: "Unauthorized access" });
      return;
    }

    const userId = req.user.userId.toString();
    const student = await Student.findById(userId);
    if (!student) {
      res.status(404).json({ success: false, message: "Student profile not found" });
      return;
    }

    const history = await getAssessmentHistory(userId);

    const historyItems: BurnoutHistoryItem[] = history.map((item) => ({
      burnoutScore: item.burnoutScore,
      completedAt: item.completedAt ?? item.createdAt,
    }));

    const baselineRecord = student.baselineBurnoutScore !== undefined && student.baselineDate && student.baselineRiskLevel
      ? {
          baselineScore: student.baselineBurnoutScore,
          baselineDate: student.baselineDate,
          baselineRisk: student.baselineRiskLevel,
        }
      : undefined;

    const summary = summarizeHistoricalAnalytics(
      historyItems,
      student.currentBurnoutScore ?? 0,
      baselineRecord
    );

    res.status(200).json({
      success: true,
      data: summary,
    });
  } catch (error) {
    next(error);
  }
};
