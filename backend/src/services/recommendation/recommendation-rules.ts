import type { AssessmentRequestBody } from "../../types/assessment.types.js";
import { RECOMMENDATION_PRIORITY_ORDER } from "./recommendation.constants.js";
import type {
  GeneratedRecommendation,
  JournalSentimentSummary,
  RecommendationCategory,
  RecommendationPriority,
} from "./recommendation.types.js";

interface RecommendationRuleContext {
  assessment: AssessmentRequestBody;
  journalSentiment?: JournalSentimentSummary;
}

interface RecommendationRuleDefinition {
  id: string;
  category: RecommendationCategory;
  priority: RecommendationPriority;
  title: string;
  message: string;
  condition: (context: RecommendationRuleContext) => boolean;
}

const RECOMMENDATION_RULES: RecommendationRuleDefinition[] = [
  {
    id: "sleep-hours-low",
    category: "sleep",
    priority: "high",
    title: "Protect Your Sleep Window",
    message: "Your sleep hours are below a healthy threshold. Try keeping a consistent bedtime and aim for at least 7 hours of rest.",
    condition: ({ assessment }) => assessment.sleepHours < 5,
  },
  {
    id: "stress-level-high",
    category: "stress",
    priority: "high",
    title: "Reduce Immediate Stress Load",
    message: "Your stress level is very high. Pause non-essential tasks, take short breaks, and use a calm breathing routine.",
    condition: ({ assessment }) => assessment.stressLevel > 8,
  },
  {
    id: "motivation-low",
    category: "motivation",
    priority: "medium",
    title: "Rebuild Motivation with Small Wins",
    message: "Motivation is low right now. Break one task into a small, visible next step and complete that first.",
    condition: ({ assessment }) => assessment.motivation < 3,
  },
  {
    id: "screen-time-high",
    category: "screen-time",
    priority: "medium",
    title: "Cut Back Evening Screen Time",
    message: "Your screen time is high. Try a device-free block before bed to help your mind recover and sleep better.",
    condition: ({ assessment }) => assessment.screenTime > 8,
  },
  {
    id: "backlog-high",
    category: "study",
    priority: "high",
    title: "Triage Your Assignment Backlog",
    message: "Your backlog is building up. Sort tasks by urgency and finish one small item before starting the next.",
    condition: ({ assessment }) => assessment.backlog > 7,
  },
  {
    id: "academic-satisfaction-low",
    category: "study",
    priority: "medium",
    title: "Reconnect With Study Goals",
    message: "Academic satisfaction is low. Review your current workload and focus on the parts that feel most meaningful first.",
    condition: ({ assessment }) => assessment.academicSatisfaction < 4,
  },
  {
    id: "energy-low",
    category: "general",
    priority: "medium",
    title: "Recover Your Energy",
    message: "Your energy score is low. Schedule a short recovery break, hydrate, and avoid back-to-back demands for a while.",
    condition: ({ assessment }) => assessment.energy < 4,
  },
];

const buildJournalSentimentRecommendation = (
  journalSentiment?: JournalSentimentSummary,
): GeneratedRecommendation | null => {
  if (!journalSentiment?.hasRecentNegativeSentiment) {
    return null;
  }

  if (journalSentiment.negativeRatio >= 60) {
    return {
      category: "mental-health",
      priority: "high",
      title: "Talk to a Mentor or Counselor",
      message: "Your recent journal entries are mostly negative. Reach out to a mentor, counselor, or trusted person before stress compounds further.",
    };
  }

  return {
    category: "mental-health",
    priority: "medium",
    title: "Take a Recovery Break",
    message: "Your journal sentiment has been trending negative recently. Step away from demanding tasks for a short reset and use a calming routine.",
  };
};

export const evaluateRecommendationRules = (context: RecommendationRuleContext): GeneratedRecommendation[] => {
  const generatedRecommendations = RECOMMENDATION_RULES.filter((rule) => rule.condition(context)).map((rule) => ({
    category: rule.category,
    priority: rule.priority,
    title: rule.title,
    message: rule.message,
    source: "rules" as const,
  }));

  const sentimentRecommendation = buildJournalSentimentRecommendation(context.journalSentiment);

  if (sentimentRecommendation) {
    generatedRecommendations.push({
      ...sentimentRecommendation,
      source: "rules" as const,
    });
  }

  return generatedRecommendations.sort((left, right) => {
    const priorityDelta = RECOMMENDATION_PRIORITY_ORDER[left.priority] - RECOMMENDATION_PRIORITY_ORDER[right.priority];

    if (priorityDelta !== 0) {
      return priorityDelta;
    }

    return left.title.localeCompare(right.title);
  });
};