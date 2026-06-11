import type { RecommendationCategory, RecommendationPriority } from "./recommendation.types.js";

export const RECOMMENDATION_PRIORITIES = ["high", "medium", "low"] as const satisfies readonly RecommendationPriority[];

export const RECOMMENDATION_CATEGORIES = [
  "sleep",
  "stress",
  "motivation",
  "study",
  "screen-time",
  "mental-health",
  "general",
] as const satisfies readonly RecommendationCategory[];

export const RECOMMENDATION_PRIORITY_ORDER: Record<RecommendationPriority, number> = {
  high: 0,
  medium: 1,
  low: 2,
};

export const RECOMMENDATION_PRIORITY_LABELS: Record<RecommendationPriority, string> = {
  high: "High",
  medium: "Medium",
  low: "Low",
};

export const RECOMMENDATION_CATEGORY_LABELS: Record<RecommendationCategory, string> = {
  sleep: "Sleep",
  stress: "Stress",
  motivation: "Motivation",
  study: "Study",
  "screen-time": "Screen Time",
  "mental-health": "Mental Health",
  general: "General",
};

export const RECOMMENDATION_DASHBOARD_LIMIT = 3;