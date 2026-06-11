import type { AssessmentRequestBody } from "../../types/assessment.types.js";

export type RecommendationPriority = "high" | "medium" | "low";

export type RecommendationCategory =
  | "sleep"
  | "stress"
  | "motivation"
  | "study"
  | "screen-time"
  | "mental-health"
  | "general";

export interface Recommendation {
  id: string;
  userId: string;
  assessmentId: string;
  category: RecommendationCategory;
  priority: RecommendationPriority;
  title: string;
  message: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface GeneratedRecommendation {
  category: RecommendationCategory;
  priority: RecommendationPriority;
  title: string;
  message: string;
  source?: "AI" | "rules";
}

export interface RecommendationAssessmentSnapshot extends AssessmentRequestBody {
  userId: string;
  assessmentId: string;
}

export interface RecommendationWithFeedback extends GeneratedRecommendation {
  id: string;
  assessmentId: string;
  createdAt: string;
  followedStatus: "none" | "followed" | "partially" | "not";
  rating: number;
  feedbackText: string;
  dateGenerated: string;
  source: "AI" | "rules";
}

export interface JournalSentimentSummary {
  hasRecentNegativeSentiment: boolean;
  negativeRatio: number;
  totalEntries: number;
  negativeEntries: number;
  recentEntries: Array<{
    sentiment: "positive" | "negative" | "neutral";
    content: string;
    createdAt: string;
  }>;
}
