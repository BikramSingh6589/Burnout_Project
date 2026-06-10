import { RiskLevel } from "../../types/common.types.js";

export interface RiskClassification {
  riskLevel: RiskLevel;
  riskDescription: string;
  riskColor: string;
}

export const classifyBurnoutRisk = (score: number): RiskClassification => {
  const normalizedScore = Math.min(100, Math.max(0, score));

  if (normalizedScore <= 39) {
    return {
      riskLevel: RiskLevel.Low,
      riskDescription: "Student shows low burnout indicators.",
      riskColor: "green",
    };
  }

  if (normalizedScore <= 69) {
    return {
      riskLevel: RiskLevel.Moderate,
      riskDescription: "Student shows moderate burnout indicators.",
      riskColor: "yellow",
    };
  }

  return {
    riskLevel: RiskLevel.High,
    riskDescription: "Student shows significant burnout indicators.",
    riskColor: "red",
  };
};
