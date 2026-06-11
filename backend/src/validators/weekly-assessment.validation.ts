import type { NextFunction, Request, Response } from "express";
import { z } from "zod";
import type { WeeklyAssessmentRequestBody } from "../types/assessment.types.js";

export class WeeklyAssessmentValidationError extends Error {
  statusCode = 400;

  constructor(message: string) {
    super(message);
  }
}

const scoreField = (fieldName: string) =>
  z
    .number()
    .min(0, { message: `${fieldName} must be between 0 and 100` })
    .max(100, { message: `${fieldName} must be between 0 and 100` });

const hoursField = (fieldName: string) =>
  z
    .number()
    .min(0, { message: `${fieldName} must be between 0 and 24` })
    .max(24, { message: `${fieldName} must be between 0 and 24` });

const scale1To10Field = (fieldName: string) =>
  z
    .number()
    .min(0, { message: `${fieldName} must be between 0 and 10` })
    .max(10, { message: `${fieldName} must be between 0 and 10` });

const weeklyAssessmentSchema = z.object({
  academicLoadScore: scoreField("academicLoadScore"),
  stressScore: scoreField("stressScore"),
  sleepHoursAverage: hoursField("sleepHoursAverage"),
  sleepQualityScore: scoreField("sleepQualityScore"),
  moodScore: scoreField("moodScore"),
  motivationScore: scoreField("motivationScore"),
  concentrationScore: scoreField("concentrationScore"),
  physicalFatigueScore: scoreField("physicalFatigueScore"),
  // Additional fields from frontend form
  stressLevel: scale1To10Field("stressLevel"),
  academicSatisfaction: scale1To10Field("academicSatisfaction"),
  studyHours: hoursField("studyHours"),
  backlog: scale1To10Field("backlog"),
  procrastination: scale1To10Field("procrastination"),
  motivation: scale1To10Field("motivation"),
  energy: scale1To10Field("energy"),
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
      next(new WeeklyAssessmentValidationError(extractMessage(result.error)));
      return;
    }

    req.body = result.data;
    next();
  };

export const validateWeeklyAssessment = validate<WeeklyAssessmentRequestBody>(weeklyAssessmentSchema);
