import { Types } from "mongoose";
import { InitialAssessment } from "../../models/InitialAssessment.js";
import { Student } from "../../models/Student.js";
import { AppError } from "../../middlewares/error.middleware.js";
import { classifyBurnoutRisk } from "../burnout/risk-classifier.service.js";
import { calculateInitialBurnoutScore } from "../burnout/burnout-score.service.js";
import { initializeBaseline } from "../burnout/baseline-tracker.service.js";
import type { InitialAssessmentRequestBody } from "../../types/assessment.types.js";
import { AssessmentStatus } from "../../types/common.types.js";
import type { IInitialAssessment } from "../../models/InitialAssessment.js";

export const submitInitialAssessment = async (
  userId: string,
  assessment: InitialAssessmentRequestBody,
): Promise<IInitialAssessment> => {
  if (!Types.ObjectId.isValid(userId)) {
    throw new AppError("Invalid user identifier", 400);
  }

  const student = await Student.findById(userId);

  if (!student) {
    throw new AppError("User profile not found", 404);
  }

  const existingAssessment = await InitialAssessment.findOne({ student: new Types.ObjectId(userId) });
  if (existingAssessment) {
    throw new AppError("Initial assessment already completed", 400);
  }

  const baselineBurnoutScore = calculateInitialBurnoutScore(assessment);
  const classification = classifyBurnoutRisk(baselineBurnoutScore);

  const assessmentRecord = new InitialAssessment({
    student: new Types.ObjectId(userId),
    ...assessment,
    baselineBurnoutScore,
    baselineRiskLevel: classification.riskLevel,
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
        currentBurnoutScore: baselineBurnoutScore,
        currentRiskLevel: classification.riskLevel,
      },
      { new: true },
    );

    if (!updatedStudent) {
      throw new AppError("User not found", 404);
    }

    await initializeBaseline(userId, baselineBurnoutScore, classification.riskLevel, createdAssessment.completedAt ?? new Date());
  } catch (error) {
    await InitialAssessment.findByIdAndDelete(createdAssessment._id).catch(() => null);
    throw error;
  }

  return createdAssessment;
};

export const getInitialAssessment = async (userId: string): Promise<IInitialAssessment | null> => {
  if (!Types.ObjectId.isValid(userId)) {
    throw new AppError("Invalid user identifier", 400);
  }

  return InitialAssessment.findOne({ student: new Types.ObjectId(userId) });
};
