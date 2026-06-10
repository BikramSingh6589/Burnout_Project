import { Types } from "mongoose";
import { InitialAssessment } from "../../models/InitialAssessment.js";
import { Student } from "../../models/Student.js";
import { AppError } from "../../middlewares/error.middleware.js";
import { classifyBurnoutRisk } from "../burnout/risk-classifier.service.js";
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

  // Check if user already has an initial assessment
  const existingAssessment = await InitialAssessment.findOne({ student: new Types.ObjectId(userId) });
  if (existingAssessment) {
    throw new AppError("Initial assessment already completed", 400);
  }

  // Calculate baseline burnout score from initial assessment metrics
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

const calculateInitialBurnoutScore = (assessment: InitialAssessmentRequestBody): number => {
  const {
    academicPressureScore,
    sleepQualityScore,
    emotionalExhaustionScore,
    cynicismScore,
    efficacyScore,
    socialSupportScore,
    financialStressScore,
  } = assessment;

  const MAX_SCORE = 100;
  const MIN_SCORE = 0;

  // Inverted scores (higher value = better, but we want it to contribute to burnout)
  const invertedEfficacy = 100 - efficacyScore;
  const invertedSocialSupport = 100 - socialSupportScore;
  const invertedSleepQuality = 100 - sleepQualityScore;

  // Weighted calculation for baseline burnout
  const weightedTotal =
    academicPressureScore * 0.2 +
    emotionalExhaustionScore * 0.25 +
    cynicismScore * 0.15 +
    invertedEfficacy * 0.15 +
    invertedSocialSupport * 0.1 +
    financialStressScore * 0.1 +
    invertedSleepQuality * 0.05;

  const score = Math.round(weightedTotal);

  return Math.min(MAX_SCORE, Math.max(MIN_SCORE, score));
};
