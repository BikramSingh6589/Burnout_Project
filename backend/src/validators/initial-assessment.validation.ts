import type { NextFunction, Request, Response } from "express";
import { z } from "zod";
import type { InitialAssessmentRequestBody } from "../types/assessment.types.js";

export class InitialAssessmentValidationError extends Error {
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

const initialAssessmentSchema = z.object({
  academicPressureScore: scoreField("academicPressureScore"),
  sleepQualityScore: scoreField("sleepQualityScore"),
  emotionalExhaustionScore: scoreField("emotionalExhaustionScore"),
  cynicismScore: scoreField("cynicismScore"),
  efficacyScore: scoreField("efficacyScore"),
  socialSupportScore: scoreField("socialSupportScore"),
  financialStressScore: scoreField("financialStressScore"),
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
      next(new InitialAssessmentValidationError(extractMessage(result.error)));
      return;
    }

    req.body = result.data;
    next();
  };

export const validateInitialAssessment = validate<InitialAssessmentRequestBody>(initialAssessmentSchema);
