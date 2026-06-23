import type { NextFunction, Request, Response } from "express";
import * as dailyAssessmentService from "../services/assessment/daily-assessment.service.js";
import type { AssessmentRequestBody } from "../types/assessment.types.js";

export const submitDailyAssessment = async (
  req: Request<Record<string, never>, unknown, AssessmentRequestBody>,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ success: false, message: "Unauthorized access" });
      return;
    }

    const assessment = await dailyAssessmentService.submitDailyAssessment(
      req.user.userId.toString(),
      req.body
    );

    res.status(201).json({
      success: true,
      message: "Daily assessment submitted successfully",
      data: { assessment },
    });
  } catch (error) {
    next(error);
  }
};

export const getDailyAssessmentHistory = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ success: false, message: "Unauthorized access" });
      return;
    }

    const history = await dailyAssessmentService.getDailyAssessmentHistory(
      req.user.userId.toString()
    );

    res.status(200).json({
      success: true,
      data: { history },
    });
  } catch (error) {
    next(error);
  }
};

export const getLatestDailyAssessment = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ success: false, message: "Unauthorized access" });
      return;
    }

    const latest = await dailyAssessmentService.getLatestDailyAssessment(
      req.user.userId.toString()
    );

    res.status(200).json({
      success: true,
      data: { assessment: latest },
    });
  } catch (error) {
    next(error);
  }
};

