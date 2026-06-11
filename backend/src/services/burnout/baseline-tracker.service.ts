import { Types } from "mongoose";
import { Student } from "../../models/Student.js";
import { AppError } from "../../middlewares/error.middleware.js";
import type { RiskLevel } from "../../types/common.types.js";
import type { BaselineComparisonResult, BaselineRecord } from "../../types/burnout.types.js";

const BASELINE_STATUS_THRESHOLD = 0;

export const initializeBaseline = async (
  userId: string,
  score: number,
  riskLevel: RiskLevel,
  baselineDate: Date,
): Promise<BaselineRecord> => {
  if (!Types.ObjectId.isValid(userId)) {
    throw new AppError("Invalid user identifier", 400);
  }

  const student = await Student.findById(userId);

  if (!student) {
    throw new AppError("User profile not found", 404);
  }

  if (student.baselineBurnoutScore !== undefined && student.baselineDate && student.baselineRiskLevel) {
    return {
      baselineScore: student.baselineBurnoutScore,
      baselineDate: student.baselineDate,
      baselineRisk: student.baselineRiskLevel,
    };
  }

  const updatedStudent = await Student.findByIdAndUpdate(
    userId,
    {
      baselineBurnoutScore: score,
      baselineDate,
      baselineRiskLevel: riskLevel,
    },
    { new: true },
  );

  if (!updatedStudent || updatedStudent.baselineBurnoutScore === undefined || !updatedStudent.baselineDate || !updatedStudent.baselineRiskLevel) {
    throw new AppError("Baseline initialization failed", 500);
  }

  return {
    baselineScore: updatedStudent.baselineBurnoutScore,
    baselineDate: updatedStudent.baselineDate,
    baselineRisk: updatedStudent.baselineRiskLevel,
  };
};

export const getBaseline = async (userId: string): Promise<BaselineRecord | null> => {
  if (!Types.ObjectId.isValid(userId)) {
    throw new AppError("Invalid user identifier", 400);
  }

  const student = await Student.findById(userId);

  if (!student) {
    throw new AppError("User profile not found", 404);
  }

  if (student.baselineBurnoutScore === undefined || !student.baselineDate || !student.baselineRiskLevel) {
    return null;
  }

  return {
    baselineScore: student.baselineBurnoutScore,
    baselineDate: student.baselineDate,
    baselineRisk: student.baselineRiskLevel,
  };
};

export const resetBaseline = async (userId: string): Promise<BaselineRecord | null> => {
  if (!Types.ObjectId.isValid(userId)) {
    throw new AppError("Invalid user identifier", 400);
  }

  const updatedStudent = await Student.findByIdAndUpdate(
    userId,
    {
      $unset: {
        baselineBurnoutScore: "",
        baselineDate: "",
        baselineRiskLevel: "",
      },
    },
    { new: true },
  );

  if (!updatedStudent) {
    throw new AppError("User profile not found", 404);
  }

  return null;
};

export const compareBaseline = (
  baseline: BaselineRecord,
  currentScore: number,
): BaselineComparisonResult => {
  const difference = Math.round(currentScore - baseline.baselineScore);
  const status = difference === BASELINE_STATUS_THRESHOLD ? "STABLE" : difference > BASELINE_STATUS_THRESHOLD ? "WORSENED" : "IMPROVED";

  return {
    baselineScore: baseline.baselineScore,
    currentScore: Math.round(currentScore),
    difference,
    status,
  };
};
