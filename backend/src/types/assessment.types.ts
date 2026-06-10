import type { ObjectId } from "./common.types.js";
import { AssessmentStatus, RiskLevel } from "./common.types.js";
import type { BurnoutScoreBreakdown } from "./burnout.types.js";

export interface AssessmentRequestBody {
  stressLevel: number;
  academicSatisfaction: number;
  studyHours: number;
  backlog: number;
  procrastination: number;
  motivation: number;
  energy: number;
  sleepHours: number;
  screenTime: number;
}

export interface BurnoutClassification {
  riskLevel: RiskLevel;
  riskDescription: string;
}

export interface AssessmentRepositoryData extends AssessmentRequestBody {
  student: ObjectId;
  burnoutScore: number;
  burnoutScoreBreakdown: BurnoutScoreBreakdown;
  riskLevel: RiskLevel;
  riskDescription: string;
  responses: AssessmentRequestBody;
  status: AssessmentStatus;
  completedAt: Date;
}

export interface AssessmentResponse {
  id: string;
  student: string;
  stressLevel: number;
  academicSatisfaction: number;
  studyHours: number;
  backlog: number;
  procrastination: number;
  motivation: number;
  energy: number;
  sleepHours: number;
  screenTime: number;
  burnoutScore: number;
  burnoutScoreBreakdown: BurnoutScoreBreakdown;
  riskLevel: RiskLevel;
  riskDescription: string;
  responses: AssessmentRequestBody;
  status: AssessmentStatus;
  completedAt: Date;
  createdAt: Date;
  updatedAt: Date;
}

export interface InitialAssessmentRequestBody {
  academicPressureScore: number;
  sleepQualityScore: number;
  emotionalExhaustionScore: number;
  cynicismScore: number;
  efficacyScore: number;
  socialSupportScore: number;
  financialStressScore: number;
}

export interface InitialAssessmentRepositoryData extends InitialAssessmentRequestBody {
  student: ObjectId;
  baselineBurnoutScore: number;
  baselineRiskLevel: RiskLevel;
  responses: InitialAssessmentRequestBody;
  status: AssessmentStatus;
  completedAt: Date;
}

export interface InitialAssessmentResponse {
  id: string;
  student: string;
  academicPressureScore: number;
  sleepQualityScore: number;
  emotionalExhaustionScore: number;
  cynicismScore: number;
  efficacyScore: number;
  socialSupportScore: number;
  financialStressScore: number;
  baselineBurnoutScore: number;
  baselineRiskLevel: RiskLevel;
  responses: InitialAssessmentRequestBody;
  status: AssessmentStatus;
  completedAt: Date;
  createdAt: Date;
  updatedAt: Date;
}

export interface WeeklyAssessmentRequestBody {
  academicLoadScore: number;
  stressScore: number;
  sleepHoursAverage: number;
  sleepQualityScore: number;
  moodScore: number;
  motivationScore: number;
  concentrationScore: number;
  physicalFatigueScore: number;
}

export interface WeeklyAssessmentRepositoryData extends WeeklyAssessmentRequestBody {
  student: ObjectId;
  weekStartDate: Date;
  burnoutScore: number;
  riskLevel: RiskLevel;
  responses: WeeklyAssessmentRequestBody;
  status: AssessmentStatus;
  completedAt: Date;
}

export interface WeeklyAssessmentResponse {
  id: string;
  student: string;
  weekStartDate: Date;
  academicLoadScore: number;
  stressScore: number;
  sleepHoursAverage: number;
  sleepQualityScore: number;
  moodScore: number;
  motivationScore: number;
  concentrationScore: number;
  physicalFatigueScore: number;
  burnoutScore: number;
  riskLevel: RiskLevel;
  responses: WeeklyAssessmentRequestBody;
  status: AssessmentStatus;
  completedAt: Date;
  createdAt: Date;
  updatedAt: Date;
}
