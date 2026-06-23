import type { NextFunction, Request, Response } from "express";
import { z } from "zod";

export class AdminValidationError extends Error {
  statusCode = 400;

  constructor(message: string) {
    super(message);
  }
}

const adminLoginSchema = z.object({
  username: z.string().trim().min(1, "Username is required"),
  password: z.string().trim().min(1, "Password is required"),
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
      next(new AdminValidationError(extractMessage(result.error)));
      return;
    }

    req.body = result.data;
    next();
  };

export const validateAdminLogin = validate<{ username: string; password: string }>(adminLoginSchema);