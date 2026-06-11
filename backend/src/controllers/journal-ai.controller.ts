import type { NextFunction, Request, Response } from "express";
import { createJournal, getJournals, deleteJournal, analyzeBurnoutRisk, JournalError } from "../services/journal/journal.service.js";

export const createJournalEntry = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ success: false, message: "Unauthorized access" });
      return;
    }

    const { content } = req.body;

    const journal = await createJournal(req.user.userId.toString(), content);

    res.status(201).json({
      success: true,
      data: journal,
    });
  } catch (error) {
    next(error);
  }
};

export const getJournalEntries = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ success: false, message: "Unauthorized access" });
      return;
    }

    const journals = await getJournals(req.user.userId.toString());

    res.status(200).json({
      success: true,
      data: journals,
    });
  } catch (error) {
    next(error);
  }
};

export const deleteJournalEntry = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ success: false, message: "Unauthorized access" });
      return;
    }

    const { id } = req.params;

    await deleteJournal(id, req.user.userId.toString());

    res.status(200).json({
      success: true,
      message: "Journal entry deleted successfully",
    });
  } catch (error) {
    if (error instanceof JournalError) {
      res.status(error.statusCode).json({
        success: false,
        message: error.message,
      });
      return;
    }
    next(error);
  }
};

export const getBurnoutRisk = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ success: false, message: "Unauthorized access" });
      return;
    }

    const riskData = await analyzeBurnoutRisk(req.user.userId.toString());

    res.status(200).json({
      success: true,
      data: riskData,
    });
  } catch (error) {
    next(error);
  }
};
