import { RiskLevel } from "../../types/common.types.js";

export interface RiskClassification {
  riskLevel: RiskLevel;
  riskDescription: string;
}

export const classifyBurnoutRisk = (score: number): RiskClassification => {
  const normalizedScore = Math.min(100, Math.max(0, score));

  if (normalizedScore <= 30) {
    return {
      riskLevel: RiskLevel.Low,
      riskDescription: "Student shows low burnout indicators.",
    };
  }

  if (normalizedScore <= 60) {
    return {
      riskLevel: RiskLevel.Moderate,
      riskDescription: "Student shows moderate burnout indicators.",
    };
  }

  if (normalizedScore <= 80) {
    return {
      riskLevel: RiskLevel.High,
      riskDescription: "Student shows significant burnout indicators.",
    };
  }

  return {
    riskLevel: RiskLevel.Critical,
    riskDescription: "Student shows critical burnout indicators.",
  };
};
