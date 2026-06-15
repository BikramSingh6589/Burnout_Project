import type { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import { config } from "../config/env.js";

interface AdminPayload {
  adminId: string;
  role: string;
  iat: number;
  exp: number;
}

declare global {
  namespace Express {
    interface Request {
      admin?: AdminPayload;
    }
  }
}

export const authenticateAdmin = (req: Request, res: Response, next: NextFunction): void => {
  try {
    const authHeader = req.headers.authorization;
    const token = authHeader?.startsWith("Bearer ") ? authHeader.slice(7) : null;

    if (!token) {
      res.status(401).json({
        success: false,
        message: "Admin authorization required",
      });
      return;
    }

    const decoded = jwt.verify(token, config.jwtSecret) as AdminPayload;

    if (decoded.role !== "admin") {
      res.status(403).json({
        success: false,
        message: "Admin access required",
      });
      return;
    }

    req.admin = decoded;
    next();
  } catch (error) {
    res.status(401).json({
      success: false,
      message: "Invalid admin token",
    });
  }
};
