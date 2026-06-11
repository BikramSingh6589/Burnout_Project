import type { NextFunction, Request, Response } from "express";
import * as initialAssessmentService from "../services/assessment/initial-assessment.service.js";
import type { InitialAssessmentRequestBody } from "../types/assessment.types.js";

export const submitInitialAssessment = async (
  req: Request<Record<string, never>, unknown, InitialAssessmentRequestBody>,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ success: false, message: "Unauthorized access" });
      return;
    }

    const assessment = await initialAssessmentService.submitInitialAssessment(
      req.user.userId.toString(),
      req.body,
    );

    res.status(201).json({
      success: true,
      message: "Initial assessment submitted successfully",
      data: { assessment },
    });
  } catch (error) {
    next(error);
  }
};

export const getInitialAssessment = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ success: false, message: "Unauthorized access" });
      return;
    }

    const assessment = await initialAssessmentService.getInitialAssessment(req.user.userId.toString());

    if (!assessment) {
      res.status(404).json({ success: false, message: "Initial assessment not found" });
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
