import type { NextFunction, Request, Response } from "express";
import { submitContactForm } from "../services/contact/contact.service.js";
import type { ContactRequestBody } from "../validators/contact.validation.js";

export const submitContact = async (
  req: Request<Record<string, never>, unknown, ContactRequestBody>,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    await submitContactForm(req.body);

    res.status(200).json({
      success: true,
      message: "Message sent successfully.",
    });
  } catch (error) {
    next(error);
  }
};
