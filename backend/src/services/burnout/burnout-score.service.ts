import type { AssessmentRequestBody } from "../../types/assessment.types.js";

const MAX_SCORE = 100;
const MIN_SCORE = 0;

export const calculateBurnoutScore = (assessment: AssessmentRequestBody): number => {
  const {
    stressLevel,
    academicSatisfaction,
    studyHours,
    backlog,
    procrastination,
    motivation,
    energy,
    sleepHours,
    screenTime,
  } = assessment;

  const invertedSleep = 10 - sleepHours;
  const invertedMotivation = 10 - motivation;
  const invertedEnergy = 10 - energy;
  const invertedAcademicSatisfaction = 10 - academicSatisfaction;

  const weightedTotal =
    stressLevel * 16 +
    invertedSleep * 16 +
    invertedMotivation * 16 +
    invertedEnergy * 16 +
    backlog * 10 +
    procrastination * 10 +
    screenTime * 8 +
    invertedAcademicSatisfaction * 6 +
    studyHours * 8;

  const score = Math.round(weightedTotal / 10);

  return Math.min(MAX_SCORE, Math.max(MIN_SCORE, score));
};
