import type { NextFunction, Request, Response } from "express";
import { z } from "zod";
import type { AssessmentRequestBody } from "../types/assessment.types.js";

export class AssessmentValidationError extends Error {
  statusCode = 400;

  constructor(message: string) {
    super(message);
  }
}

const numberField = (fieldName: string) =>
  z
    .number()
    .min(0, { message: `${fieldName} must be between 0 and 10` })
    .max(10, { message: `${fieldName} must be between 0 and 10` });

const assessmentSchema = z.object({
  stressLevel: numberField("stressLevel"),
  academicSatisfaction: numberField("academicSatisfaction"),
  studyHours: numberField("studyHours"),
  backlog: numberField("backlog"),
  procrastination: numberField("procrastination"),
  motivation: numberField("motivation"),
  energy: numberField("energy"),
  sleepHours: numberField("sleepHours"),
  screenTime: numberField("screenTime"),
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
      next(new AssessmentValidationError(extractMessage(result.error)));
      return;
    }

    req.body = result.data;
    next();
  };

export const validateAssessment = validate<AssessmentRequestBody>(assessmentSchema);
