import { Types } from "mongoose";
import { Assessment } from "../../models/Assessment.js";
import { Student } from "../../models/Student.js";
import { AppError } from "../../middlewares/error.middleware.js";
import { calculateBurnoutScore } from "../burnout/burnout-score.service.js";
import { classifyBurnoutRisk } from "../burnout/risk-classifier.service.js";
import { initializeBaseline } from "../burnout/baseline-tracker.service.js";
import type { AssessmentRequestBody } from "../../types/assessment.types.js";
import { AssessmentStatus } from "../../types/common.types.js";
import type { IAssessment } from "../../models/Assessment.js";

export const submitAssessment = async (userId: string, assessment: AssessmentRequestBody): Promise<IAssessment> => {
  if (!Types.ObjectId.isValid(userId)) {
    throw new AppError("Invalid user identifier", 400);
  }

  const student = await Student.findById(userId);

  if (!student) {
    throw new AppError("User profile not found", 404);
  }

  const { burnoutScore, burnoutScoreBreakdown } = calculateBurnoutScore(assessment);
  const classification = classifyBurnoutRisk(burnoutScore);

  const assessmentRecord = new Assessment({
    student: new Types.ObjectId(userId),
    ...assessment,
    burnoutScore,
    burnoutScoreBreakdown,
    riskLevel: classification.riskLevel,
    riskDescription: classification.riskDescription,
    responses: { ...assessment },
    status: AssessmentStatus.Completed,
    completedAt: new Date(),
  });

  const createdAssessment = await assessmentRecord.save();

  try {
    const updatedStudent = await Student.findByIdAndUpdate(
      userId,
      {
        assessmentCompleted: true,
        currentBurnoutScore: burnoutScore,
        currentRiskLevel: classification.riskLevel,
      },
      { new: true },
    );

    if (updatedStudent) {
      await initializeBaseline(userId, burnoutScore, classification.riskLevel, createdAssessment.completedAt ?? new Date());
    }

    if (!updatedStudent) {
      throw new AppError("User not found", 404);
    }
  } catch (error) {
    await Assessment.findByIdAndDelete(createdAssessment._id).catch(() => null);
    throw error;
  }

  return createdAssessment;
};

export const getAssessmentHistory = async (userId: string): Promise<IAssessment[]> => {
  if (!Types.ObjectId.isValid(userId)) {
    throw new AppError("Invalid user identifier", 400);
  }

  return Assessment.find({ student: new Types.ObjectId(userId) }).sort({ createdAt: -1 });
};

export const getLatestAssessment = async (userId: string): Promise<IAssessment | null> => {
  if (!Types.ObjectId.isValid(userId)) {
    throw new AppError("Invalid user identifier", 400);
  }

  return Assessment.findOne({ student: new Types.ObjectId(userId) }).sort({ createdAt: -1 });
};
