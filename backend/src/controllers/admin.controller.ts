import type { Request, Response, NextFunction } from "express";
import * as adminService from "../services/admin/admin.service.js";

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
  req: Request<Record<string, never>, unknown, { studentId: string; subject: string; message: string }>,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { studentId, subject, message } = req.body;

    if (!studentId || !subject || !message) {
      res.status(400).json({
        success: false,
        error: "studentId, subject, and message are required",
      });
      return;
    }

    await adminService.sendWellnessEmail(studentId, subject, message);

    res.status(200).json({
      success: true,
      message: "Email sent successfully",
    });
  } catch (error) {
    next(error);
  }
};
