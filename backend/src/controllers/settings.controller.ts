import type { NextFunction, Request, Response } from "express";
import { Settings, type ISettings } from "../models/Settings.js";

const DEFAULT_SETTINGS: Omit<ISettings, '_id' | 'createdAt' | 'updatedAt'> = {
  highRiskThreshold: 70,
  moderateRiskThreshold: 40,
  assessmentIntervalDays: 7,
  maxWeeklyAssessmentsPerStudent: 1,
  emailNotificationsEnabled: true,
  inAppNotificationsEnabled: true,
};

export const getSettings = async (_req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    let settings = await Settings.findOne();

    if (!settings) {
      // Create default settings if none exist
      settings = new Settings(DEFAULT_SETTINGS);
      await settings.save();
    }

    res.status(200).json({
      success: true,
      data: settings.toObject(),
    });
  } catch (error) {
    next(error);
  }
};

export const updateSettings = async (
  req: Request<Record<string, never>, unknown, Partial<Omit<ISettings, '_id' | 'createdAt' | 'updatedAt'>>>,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    let settings = await Settings.findOne();

    if (!settings) {
      settings = new Settings(DEFAULT_SETTINGS);
    }

    // Update allowed fields
    Object.assign(settings, req.body);
    await settings.save();

    res.status(200).json({
      success: true,
      data: settings.toObject(),
      message: "Settings updated successfully",
    });
  } catch (error) {
    next(error);
  }
};
