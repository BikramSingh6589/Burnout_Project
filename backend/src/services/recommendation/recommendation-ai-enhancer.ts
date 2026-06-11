import type { AssessmentRequestBody } from "../../types/assessment.types.js";
import {
  RECOMMENDATION_CATEGORIES,
  RECOMMENDATION_PRIORITIES,
  RECOMMENDATION_PRIORITY_ORDER,
} from "./recommendation.constants.js";
import type {
  GeneratedRecommendation,
  JournalSentimentSummary,
  RecommendationCategory,
  RecommendationPriority,
} from "./recommendation.types.js";

const GROQ_API_KEY = process.env.GROQ_API_KEY;
const GROQ_MODEL = process.env.GROQ_MODEL || "llama-3.1-8b-instant";
const GROQ_API_URL = "https://api.groq.com/openai/v1/chat/completions";
const MAX_AI_RECOMMENDATIONS = 5;

export interface RecommendationEnhancementContext {
  userId: string;
  assessment: AssessmentRequestBody;
  journalSentiment: JournalSentimentSummary;
}

export interface RecommendationEnhancer {
  enhance: (
    recommendations: GeneratedRecommendation[],
    context: RecommendationEnhancementContext,
  ) => Promise<GeneratedRecommendation[]>;
}

interface GroqChatCompletionResponse {
  choices?: Array<{
    message?: {
      content?: string;
    };
  }>;
}

const isRecommendationCategory = (value: unknown): value is RecommendationCategory => {
  return typeof value === "string" && RECOMMENDATION_CATEGORIES.includes(value as RecommendationCategory);
};

const isRecommendationPriority = (value: unknown): value is RecommendationPriority => {
  return typeof value === "string" && RECOMMENDATION_PRIORITIES.includes(value as RecommendationPriority);
};

const cleanText = (value: unknown, maxLength: number): string | null => {
  if (typeof value !== "string") {
    return null;
  }

  const text = value.trim();
  if (!text) {
    return null;
  }

  return text.slice(0, maxLength);
};

const parseJsonArray = (content: string): unknown[] | null => {
  try {
    const parsed = JSON.parse(content);
    return Array.isArray(parsed) ? parsed : null;
  } catch {
    const match = content.match(/\[[\s\S]*\]/);
    if (!match) {
      return null;
    }

    try {
      const parsed = JSON.parse(match[0]);
      return Array.isArray(parsed) ? parsed : null;
    } catch {
      return null;
    }
  }
};

const validateAiRecommendations = (items: unknown[]): GeneratedRecommendation[] => {
  const results: GeneratedRecommendation[] = [];

  for (const item of items) {
    if (!item || typeof item !== "object") continue;

    const candidate = item as Record<string, unknown>;
    const category = candidate.category;
    const priority = candidate.priority;
    const title = cleanText(candidate.title, 180);
    const message = cleanText(candidate.message, 1000);

    if (!isRecommendationCategory(category) || !isRecommendationPriority(priority) || !title || !message) {
      continue;
    }

    results.push({
      category,
      priority,
      title,
      message,
      source: "AI",
    });
  }

  return results.slice(0, MAX_AI_RECOMMENDATIONS);
};

const dedupeAndSortRecommendations = (recommendations: GeneratedRecommendation[]): GeneratedRecommendation[] => {
  // AI recommendations take priority over rule-based ones with the same key
  const recommendationMap = new Map<string, GeneratedRecommendation>();

  for (const recommendation of recommendations) {
    const key = `${recommendation.category}:${recommendation.title.toLowerCase()}`;
    const existing = recommendationMap.get(key);
    // Prefer AI source if there is a duplicate
    if (!existing || recommendation.source === "AI") {
      recommendationMap.set(key, recommendation);
    }
  }

  return [...recommendationMap.values()].sort((left, right) => {
    const priorityDelta = RECOMMENDATION_PRIORITY_ORDER[left.priority] - RECOMMENDATION_PRIORITY_ORDER[right.priority];
    return priorityDelta || left.title.localeCompare(right.title);
  });
};

const buildPrompt = (
  recommendations: GeneratedRecommendation[],
  context: RecommendationEnhancementContext,
): string => {
  return JSON.stringify({
    task: "Create personalized academic burnout intervention recommendations from structured student wellness signals.",
    constraints: [
      "Return only a JSON array. No markdown. No explanation outside JSON.",
      `Return between 1 and ${MAX_AI_RECOMMENDATIONS} recommendations.`,
      "Each item must have category, priority, title, and message.",
      `category must be one of: ${RECOMMENDATION_CATEGORIES.join(", ")}.`,
      `priority must be one of: ${RECOMMENDATION_PRIORITIES.join(", ")}.`,
      "Recommendations must be practical, student-safe, non-clinical, and specific to the signals.",
      "Do not diagnose medical conditions. For severe distress, suggest contacting a counselor or trusted support.",
    ],
    assessmentSignals: context.assessment,
    journalSentimentSummary: context.journalSentiment,
    ruleBasedRecommendations: recommendations,
  });
};

const ruleOnlyEnhancer: RecommendationEnhancer = {
  async enhance(recommendations) {
    return recommendations;
  },
};

const groqRecommendationEnhancer: RecommendationEnhancer = {
  async enhance(recommendations, context) {
    if (!GROQ_API_KEY) {
      return recommendations;
    }

    try {
      const response = await fetch(GROQ_API_URL, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${GROQ_API_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: GROQ_MODEL,
          messages: [
            {
              role: "system",
              content:
                "You are a student wellness recommendation engine. You produce concise, safe, actionable burnout-prevention interventions as strict JSON.",
            },
            {
              role: "user",
              content: buildPrompt(recommendations, context),
            },
          ],
          temperature: 0.3,
          max_tokens: 900,
        }),
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error(`[RecommendationAI] Groq API error: ${response.status} ${response.statusText}`, errorText);
        return recommendations;
      }

      const data = (await response.json()) as GroqChatCompletionResponse;
      const content = data.choices?.[0]?.message?.content?.trim();
      if (!content) {
        return recommendations;
      }

      const parsedItems = parseJsonArray(content);
      if (!parsedItems) {
        console.error("[RecommendationAI] Groq returned non-JSON recommendation content:", content);
        return recommendations;
      }

      const aiRecommendations = validateAiRecommendations(parsedItems);
      if (aiRecommendations.length === 0) {
        return recommendations;
      }

      return dedupeAndSortRecommendations([...aiRecommendations, ...recommendations]);
    } catch (error) {
      console.error("[RecommendationAI] Failed to enhance recommendations:", error);
      return recommendations;
    }
  },
};

export const getRecommendationEnhancer = (): RecommendationEnhancer => {
  return GROQ_API_KEY ? groqRecommendationEnhancer : ruleOnlyEnhancer;
};
