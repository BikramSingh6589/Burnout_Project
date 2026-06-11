import type { NextFunction, Request, Response } from "express";
import { z } from "zod";

export class ValidationError extends Error {
  statusCode = 400;

  constructor(message: string) {
    super(message);
  }
}

const contentSchema = z
  .string()
  .trim()
  .min(10, "Journal content must be at least 10 characters")
  .max(2000, "Journal content must not exceed 2000 characters");

const createJournalSchema = z.object({
  content: contentSchema,
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
      next(new ValidationError(extractMessage(result.error)));
      return;
    }

    req.body = result.data;
    next();
  };

export const validateCreateJournal = validate<{ content: string }>(createJournalSchema);
