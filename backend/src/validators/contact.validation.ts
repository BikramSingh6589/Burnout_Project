import type { NextFunction, Request, Response } from "express";
import { z } from "zod";

export class ContactValidationError extends Error {
  statusCode = 400;

  constructor(message: string) {
    super(message);
    this.name = "ValidationError";
  }
}

const contactSchema = z.object({
  name: z.string().trim().min(1, "Name is required").max(100, "Name must be 100 characters or fewer"),
  email: z.string().trim().toLowerCase().email("Valid email is required").max(254, "Email must be 254 characters or fewer"),
  message: z.string().trim().min(1, "Message is required").max(2000, "Message must be 2000 characters or fewer"),
});

export type ContactRequestBody = z.infer<typeof contactSchema>;

const extractMessage = (error: z.ZodError): string => error.issues[0]?.message ?? "Validation failed";

export const validateContact = (req: Request, _res: Response, next: NextFunction): void => {
  const result = contactSchema.safeParse(req.body);

  if (!result.success) {
    next(new ContactValidationError(extractMessage(result.error)));
    return;
  }

  req.body = result.data;
  next();
};
