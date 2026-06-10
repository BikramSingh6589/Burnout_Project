import type { ObjectId } from "./common.types.js";
import { AssessmentStatus, RiskLevel } from "./common.types.js";

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
  riskLevel: RiskLevel;
  riskDescription: string;
  responses: AssessmentRequestBody;
  status: AssessmentStatus;
  completedAt: Date;
  createdAt: Date;
  updatedAt: Date;
}
