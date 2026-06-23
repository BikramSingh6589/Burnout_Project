import type { Request, Response, NextFunction } from "express";
import * as adminService from "../services/admin/admin.service.js";
import { runWeeklyReminderJob } from "../jobs/reminder.job.js";

export const loginAdmin = async (
  req: Request<Record<string, never>, unknown, { username: string; password: string }>,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const result = await adminService.loginAdmin(req.body);

    res.status(200).json({
      success: true,
      token: result.token,
      admin: result.admin,
    });
  } catch (error) {
    next(error);
  }
};

export const getDashboard = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const metrics = await adminService.getDashboardMetrics();

    res.status(200).json({
      success: true,
      data: metrics,
    });
  } catch (error) {
    next(error);
  }
};

export const getStudents = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 20;

    const result = await adminService.getAllStudents(page, limit);

    res.status(200).json({
      success: true,
      data: result.students,
      pagination: {
        page,
        limit,
        total: result.total,
      },
    });
  } catch (error) {
    next(error);
  }
};

export const getHighRiskStudents = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 20;

    const result = await adminService.getHighRiskStudents(page, limit);

    res.status(200).json({
      success: true,
      data: result.students,
      pagination: {
        page,
        limit,
        total: result.total,
      },
    });
  } catch (error) {
    next(error);
  }
};

export const getStudentDetail = async (
  req: Request<{ studentId: string }>,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const detail = await adminService.getStudentDetail(req.params.studentId);

    res.status(200).json({
      success: true,
      data: detail,
    });
  } catch (error) {
    next(error);
  }
};

export const sendWellnessEmail = async (
  req: Request<Record<string, never>, unknown, { studentId: string }>,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { studentId } = req.body;

    if (!studentId) {
      res.status(400).json({
        success: false,
        error: "studentId is required",
      });
      return;
    }

    await adminService.sendWellnessEmail(studentId);

    res.status(200).json({
      success: true,
      message: "Email sent successfully",
    });
  } catch (error) {
    next(error);
  }
};

export const sendBulkWellnessEmail = async (
  req: Request<Record<string, never>, unknown, { riskGroup: "high" | "moderate" | "low" }>,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { riskGroup } = req.body;

    if (!riskGroup || !["high", "moderate", "low"].includes(riskGroup)) {
      res.status(400).json({
        success: false,
        error: "riskGroup must be one of: high, moderate, low",
      });
      return;
    }

    const result = await adminService.sendBulkWellnessEmail(riskGroup);

    res.status(200).json({
      success: true,
      message: `Sent ${result.sent} email(s) to ${riskGroup} risk students`,
      data: result,
    });
  } catch (error) {
    next(error);
  }
};

export const triggerWeeklyReminderJob = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const result = await runWeeklyReminderJob();
    res.status(200).json({
      success: true,
      message: "Weekly reminder job triggered successfully",
      data: result,
    });
  } catch (error) {
    next(error);
  }
};
