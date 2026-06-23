import type { NextFunction, Request, Response } from "express";
import { z } from "zod";
import type { AssessmentRequestBody } from "../types/assessment.types.js";

export class DailyAssessmentValidationError extends Error {
  statusCode = 400;

  constructor(message: string) {
    super(message);
  }
}

const scaleField = (fieldName: string) =>
  z
    .number()
    .min(0, { message: `${fieldName} must be between 0 and 10` })
    .max(10, { message: `${fieldName} must be between 0 and 10` });

const hoursField = (fieldName: string) =>
  z
    .number()
    .min(0, { message: `${fieldName} must be between 0 and 24` })
    .max(24, { message: `${fieldName} must be between 0 and 24` });

const dailyAssessmentSchema = z.object({
  stressLevel: scaleField("stressLevel"),
  academicSatisfaction: scaleField("academicSatisfaction"),
  studyHours: hoursField("studyHours"),
  backlog: scaleField("backlog"),
  procrastination: scaleField("procrastination"),
  motivation: scaleField("motivation"),
  energy: scaleField("energy"),
  sleepHours: hoursField("sleepHours"),
  screenTime: hoursField("screenTime"),
});

type RequestValidator<TBody> = z.ZodType<TBody>;

const extractMessage = (error: z.ZodError): string => {
  return error.issues[0]?.message ?? "Validation failed";
};

const validate =
  <TBody>(schema: RequestValidator<TBody>) =>
  (req: Request<Record<string, never>, unknown, TBody>, _res: Response, next: NextFunction): void => {
    const result = schema.safeParse(req.body);

    if (!result.success) {
      next(new DailyAssessmentValidationError(extractMessage(result.error)));
      return;
    }

    req.body = result.data;
    next();
  };

export const validateDailyAssessment = validate<AssessmentRequestBody>(dailyAssessmentSchema);

