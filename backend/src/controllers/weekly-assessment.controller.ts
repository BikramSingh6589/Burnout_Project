import type { NextFunction, Request, Response } from "express";
import * as weeklyAssessmentService from "../services/assessment/weekly-assessment.service.js";
import type { WeeklyAssessmentRequestBody } from "../types/assessment.types.js";

export const submitWeeklyAssessment = async (
  req: Request<Record<string, never>, unknown, WeeklyAssessmentRequestBody>,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ success: false, message: "Unauthorized access" });
      return;
    }

    const assessment = await weeklyAssessmentService.submitWeeklyAssessment(
      req.user.userId.toString(),
      req.body,
    );

    res.status(201).json({
      success: true,
      message: "Weekly assessment submitted successfully",
      data: { assessment },
    });
  } catch (error) {
    next(error);
  }
};

export const getWeeklyAssessmentHistory = async (_req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    if (!_req.user) {
      res.status(401).json({ success: false, message: "Unauthorized access" });
      return;
    }

    const history = await weeklyAssessmentService.getWeeklyAssessmentHistory(_req.user.userId.toString());

    res.status(200).json({
      success: true,
      data: { history },
    });
  } catch (error) {
    next(error);
  }
};

export const getLatestWeeklyAssessment = async (_req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    if (!_req.user) {
      res.status(401).json({ success: false, message: "Unauthorized access" });
      return;
    }

    const assessment = await weeklyAssessmentService.getLatestWeeklyAssessment(_req.user.userId.toString());

    if (!assessment) {
      res.status(404).json({ success: false, message: "No weekly assessment found" });
      return;
    }

    res.status(200).json({
      success: true,
      data: { assessment },
    });
  } catch (error) {
    next(error);
  }
};
