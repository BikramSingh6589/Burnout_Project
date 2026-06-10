import type {
  AssessmentRequestBody,
  InitialAssessmentRequestBody,
  WeeklyAssessmentRequestBody,
} from "../../types/assessment.types.js";
import type { BurnoutScoreBreakdown, BurnoutScoreResult } from "../../types/burnout.types.js";

const MAX_SCORE = 100;
const MIN_SCORE = 0;

const clamp = (value: number): number => Math.min(MAX_SCORE, Math.max(MIN_SCORE, value));

const round = (value: number): number => Math.round(value);

export const calculateBurnoutScore = (assessment: AssessmentRequestBody): BurnoutScoreResult => {
  const breakdown: BurnoutScoreBreakdown = {
    stress: round((assessment.stressLevel / 10) * 28),
    sleep: round((Math.max(0, 8 - assessment.sleepHours) / 8) * 22),
    motivation: round(((10 - assessment.motivation) / 10) * 16),
    energy: round(((10 - assessment.energy) / 10) * 14),
    backlog: round((assessment.backlog / 10) * 7),
    procrastination: round((assessment.procrastination / 10) * 6),
    screenTime: round(Math.min(1, assessment.screenTime / 24) * 4),
    academicSatisfaction: round(((10 - assessment.academicSatisfaction) / 10) * 2),
    studyHours: round((Math.max(0, 12 - assessment.studyHours) / 12) * 1),
  };

  const burnoutScore = clamp(
    breakdown.stress +
      breakdown.sleep +
      breakdown.motivation +
      breakdown.energy +
      breakdown.backlog +
      breakdown.procrastination +
      breakdown.screenTime +
      breakdown.academicSatisfaction +
      breakdown.studyHours,
  );

  return {
    burnoutScore,
    burnoutScoreBreakdown: breakdown,
  };
};

export const calculateWeeklyBurnoutScore = (assessment: WeeklyAssessmentRequestBody): number => {
  const sleepPenalty = Math.max(0, 8 - assessment.sleepHoursAverage) * 5;
  const invertedSleepQuality = Math.max(0, 100 - assessment.sleepQualityScore);
  const invertedMood = Math.max(0, 100 - assessment.moodScore);
  const invertedMotivation = Math.max(0, 100 - assessment.motivationScore);
  const invertedConcentration = Math.max(0, 100 - assessment.concentrationScore);

  const weightedTotal =
    assessment.academicLoadScore * 0.15 +
    assessment.stressScore * 0.2 +
    sleepPenalty * 0.15 +
    invertedSleepQuality * 0.1 +
    invertedMood * 0.15 +
    invertedMotivation * 0.15 +
    invertedConcentration * 0.05 +
    assessment.physicalFatigueScore * 0.05;

  return clamp(Math.round(weightedTotal));
};

export const calculateInitialBurnoutScore = (assessment: InitialAssessmentRequestBody): number => {
  const invertedEfficacy = Math.max(0, 100 - assessment.efficacyScore);
  const invertedSocialSupport = Math.max(0, 100 - assessment.socialSupportScore);
  const invertedSleepQuality = Math.max(0, 100 - assessment.sleepQualityScore);

  const weightedTotal =
    assessment.academicPressureScore * 0.2 +
    assessment.emotionalExhaustionScore * 0.25 +
    assessment.cynicismScore * 0.15 +
    invertedEfficacy * 0.15 +
    invertedSocialSupport * 0.1 +
    assessment.financialStressScore * 0.1 +
    invertedSleepQuality * 0.05;

  return clamp(Math.round(weightedTotal));
};
