import type { NextFunction, Request, Response } from "express";
import * as assessmentService from "../services/assessment/assessment.service.js";
import type { AssessmentRequestBody } from "../types/assessment.types.js";

export const submitAssessment = async (
  req: Request<Record<string, never>, unknown, AssessmentRequestBody>,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ success: false, message: "Unauthorized access" });
      return;
    }

    const assessment = await assessmentService.submitAssessment(req.user.userId.toString(), req.body);

    res.status(201).json({
      success: true,
      message: "Assessment submitted successfully",
      data: { assessment },
    });
  } catch (error) {
    next(error);
  }
};

export const getAssessmentHistory = async (_req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    if (!_req.user) {
      res.status(401).json({ success: false, message: "Unauthorized access" });
      return;
    }

    const history = await assessmentService.getAssessmentHistory(_req.user.userId.toString());

    res.status(200).json({
      success: true,
      data: { history },
    });
  } catch (error) {
    next(error);
  }
};

export const getLatestAssessment = async (_req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    if (!_req.user) {
      res.status(401).json({ success: false, message: "Unauthorized access" });
      return;
    }

    const assessment = await assessmentService.getLatestAssessment(_req.user.userId.toString());

    if (!assessment) {
      res.status(404).json({ success: false, message: "No assessment found" });
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
