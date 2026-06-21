import { Types } from "mongoose";
import { getDashboardAnalytics } from "../analytics/dashboard.service.js";
import { getLatestAssessment } from "../assessment/assessment.service.js";
import type { IAIMessage } from "../../models/AIConversation.js";
import type { IStudent } from "../../models/Student.js";
import type { IAssessment } from "../../models/Assessment.js";
import { ConversationRole } from "../../types/common.types.js";
import { NotificationService } from "../notification.service.js";
import {
  classifyTopic,
  RESTRICTED_TOPIC_RESPONSE,
} from "./topic-classifier.js";

const GROQ_API_KEY = process.env.GROQ_API_KEY;
const GROQ_MODEL = process.env.GROQ_MODEL ?? "llama-3.1-8b-instant";
const GROQ_API_URL = "https://api.groq.com/openai/v1/chat/completions";

const SYSTEM_PROMPT = `You are a Student Wellness and Burnout Assistant integrated into a Student Burnout Detection and Wellness Platform.

You are NOT a general-purpose AI assistant, NOT ChatGPT, NOT a coding assistant, and NOT a search engine.

Your primary purpose is to help students with:
- Burnout prevention, recovery, symptoms, causes, and warning signs
- Academic wellbeing, stress, exam pressure, anxiety, and mental wellness
- Productivity, focus, concentration, time management, and procrastination
- Study habits, planning, revision, routines, and consistency
- Sleep quality, healthy routines, screen time, and daily schedules
- High-level student career guidance (career path, placement anxiety, goals, skill planning)

You must REFUSE and redirect questions about:
- Programming, coding, debugging, algorithms, DSA, system design, SQL, or technical tutorials
- General knowledge (weather, politics, history, geography, trivia, current affairs, prices)
- Entertainment (movies, celebrities, sports, music, TV shows)
- Lifestyle topics unrelated to student wellness (cooking, recipes, fashion, shopping, travel, cars, crypto, stocks)

If a user asks about a restricted topic, respond with the standard refusal message and list what you can help with.

For allowed topics:
- Be friendly, supportive, practical, and student-focused
- Keep responses concise (about 80-200 words) unless the user asks for more detail
- When the question relates to stress, burnout, sleep, productivity, or wellness, personalize using available student context naturally
- Do not mention burnout score or wellness metrics in every answer; use context only when relevant`;

const normalizeRole = (role: ConversationRole) => {
  if (role === ConversationRole.Assistant) return "assistant";
  if (role === ConversationRole.Student) return "user";
  return "assistant";
};

const buildContextSummary = (student: IStudent, analytics: any, latestAssessment: IAssessment | null): string => {
  const lines: string[] = [];

  if (analytics) {
    if (typeof analytics.burnoutScore === "number") {
      lines.push(`Burnout Score: ${analytics.burnoutScore}`);
    }
    if (analytics.riskLevel) {
      lines.push(`Risk Level: ${String(analytics.riskLevel).toUpperCase()}`);
    }
    if (typeof analytics.sleepAverage === "number") {
      lines.push(`Sleep Average: ${analytics.sleepAverage}`);
    }
    if (analytics.moodTrend) {
      lines.push(`Mood Trend: ${analytics.moodTrend}`);
    }
    if (analytics.currentTrend) {
      lines.push(`Burnout Trend: ${analytics.currentTrend}`);
    }
    if (analytics.assessmentCount !== undefined) {
      lines.push(`Total Assessments: ${analytics.assessmentCount}`);
    }
    if (analytics.baselineComparison) {
      lines.push(`Baseline Comparison: baseline score ${analytics.baselineComparison.baselineScore}, current score ${analytics.baselineComparison.currentScore}, difference ${analytics.baselineComparison.difference}, status ${analytics.baselineComparison.status}.`);
    }

    if (Array.isArray(analytics.recommendations) && analytics.recommendations.length > 0) {
      const activeRecs = analytics.recommendations.slice(0, 3);
      lines.push("Recommendations:");
      activeRecs.forEach((rec: any) => {
        lines.push(`- ${rec.title}${rec.priority ? ` (${String(rec.priority).charAt(0).toUpperCase() + String(rec.priority).slice(1)})` : ""}`);
      });
    }
  }

  if (latestAssessment) {
    const assessmentLines: string[] = [];
    assessmentLines.push(`Burnout Score ${latestAssessment.burnoutScore}`);
    if (latestAssessment.riskLevel) {
      assessmentLines.push(`Risk Level ${String(latestAssessment.riskLevel).toUpperCase()}`);
    }
    if (typeof latestAssessment.stressLevel === "number") {
      assessmentLines.push(`Stress Level ${latestAssessment.stressLevel}`);
    }
    if (typeof latestAssessment.sleepHours === "number") {
      assessmentLines.push(`Sleep Hours ${latestAssessment.sleepHours}`);
    }
    if (typeof latestAssessment.motivation === "number") {
      assessmentLines.push(`Motivation ${latestAssessment.motivation}`);
    }
    if (typeof latestAssessment.energy === "number") {
      assessmentLines.push(`Energy ${latestAssessment.energy}`);
    }
    if (typeof latestAssessment.studyHours === "number") {
      assessmentLines.push(`Study Hours ${latestAssessment.studyHours}`);
    }
    if (typeof latestAssessment.procrastination === "number") {
      assessmentLines.push(`Procrastination ${latestAssessment.procrastination}`);
    }
    if (typeof latestAssessment.screenTime === "number") {
      assessmentLines.push(`Screen Time ${latestAssessment.screenTime}`);
    }
    if (assessmentLines.length > 0) {
      lines.push(`Latest Assessment Summary: ${assessmentLines.join(", ")}.`);
    }
  }

  if (lines.length === 0) {
    return "Student wellness context is not currently available.";
  }

  return `Student Context:\n${lines.join("\n")}`;
};

const buildConversationMessages = (messages: IAIMessage[]) => {
  const recentMessages = messages
    .filter((message) => message.role !== ConversationRole.System)
    .slice(-14)
    .map((message) => ({
      role: normalizeRole(message.role),
      content: message.content.trim(),
    }));

  return recentMessages;
};

const extractGroqResponse = async (response: Response): Promise<string> => {
  const body = await response.json().catch(() => null);

  if (!response.ok) {
    const errorMessage = body?.error?.message || body?.message || `Groq request failed with status ${response.status}`;
    throw new Error(errorMessage);
  }

  const choice = body?.choices?.[0];
  if (!choice || !choice.message?.content) {
    throw new Error("Groq response did not contain valid message content.");
  }

  return String(choice.message.content).trim();
};

const parseStreamEvent = (line: string) => {
  const trimmed = line.trim();
  if (!trimmed.startsWith("data:")) return null;
  const payload = trimmed.slice(5).trim();
  if (!payload || payload === "[DONE]") return { done: true };

  try {
    const parsed = JSON.parse(payload);
    const content = parsed?.choices?.[0]?.delta?.content;
    return { content: typeof content === "string" ? content : null };
  } catch {
    return { content: payload };
  }
};

export const streamAIResponse = async (
  userId: string,
  student: IStudent,
  conversationMessages: IAIMessage[],
  userMessage: string,
  onDelta: (chunk: string) => Promise<void> | void,
): Promise<string> => {
  if (classifyTopic(userMessage) === "RESTRICTED") {
    await onDelta(RESTRICTED_TOPIC_RESPONSE);
    return RESTRICTED_TOPIC_RESPONSE;
  }

  if (!GROQ_API_KEY) {
    throw new Error("GROQ_API_KEY is not configured.");
  }

  const analytics = await getDashboardAnalytics(userId);
  const latestAssessment = await getLatestAssessment(userId).catch(() => null);
  const wellnessContext = buildContextSummary(student, analytics, latestAssessment);
  const conversation = buildConversationMessages(conversationMessages);

  const systemMessages = [
    { role: "system", content: SYSTEM_PROMPT },
    { role: "system", content: wellnessContext },
  ];

  const payload = {
    model: GROQ_MODEL,
    messages: [
      ...systemMessages,
      ...conversation,
      { role: "user", content: userMessage.trim() },
    ],
    temperature: 0.7,
    max_tokens: 512,
    top_p: 0.95,
    stream: true,
  };

  const response = await fetch(GROQ_API_URL, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${GROQ_API_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    const bodyText = await response.text().catch(() => null);
    let errorMessage = `Groq request failed with status ${response.status}`;
    if (bodyText) {
      try {
        const parsed = JSON.parse(bodyText);
        errorMessage = parsed?.error?.message || parsed?.message || errorMessage;
      } catch {
        errorMessage = bodyText;
      }
    }
    throw new Error(errorMessage);
  }

  if (!response.body) {
    throw new Error("Groq streaming response body is unavailable.");
  }

  const reader = response.body.getReader();
  const decoder = new TextDecoder();
  let buffer = "";
  let assistantText = "";
  let eventType = "message";
  let eventData = "";

  const flushEvent = async (): Promise<void> => {
    if (!eventData) return;

    if (eventType === "message") {
      const parsedEvent = parseStreamEvent(`data: ${eventData}`);
      if (parsedEvent?.done) {
        eventType = "message";
        eventData = "";
        return;
      }

      if (parsedEvent?.content) {
        assistantText += parsedEvent.content;
        await onDelta(parsedEvent.content);
      }
    }

    eventType = "message";
    eventData = "";
  };

  while (true) {
    const { value, done } = await reader.read();
    if (done) break;

    buffer += decoder.decode(value, { stream: true });
    const lines = buffer.split(/\r?\n/);
    buffer = lines.pop() ?? "";

    for (const line of lines) {
      const trimmed = line.trim();
      if (!trimmed) {
        await flushEvent();
        continue;
      }

      if (trimmed.startsWith("event:")) {
        eventType = trimmed.slice(6).trim();
      } else if (trimmed.startsWith("data:")) {
        const content = trimmed.slice(5).trim();
        if (content === "[DONE]") {
          await flushEvent();
          return assistantText.trim();
        }

        if (eventData) {
          eventData += "\n";
        }
        eventData += content;
      }
    }
  }

  await flushEvent();
  return assistantText.trim();
};

export const generateAIResponse = async (
  userId: string,
  student: IStudent,
  conversationMessages: IAIMessage[],
  userMessage: string,
) => {
  if (classifyTopic(userMessage) === "RESTRICTED") {
    return RESTRICTED_TOPIC_RESPONSE;
  }

  // Trigger AI alert if message contains stress patterns
  try {
    const triggerPatterns = ["stressed", "burnout", "overwhelmed", "hopeless", "exhausted", "can't cope", "giving up"];
    const messageLower = userMessage.toLowerCase();
    const hasTrigger = triggerPatterns.some((pattern) => messageLower.includes(pattern));
    if (hasTrigger) {
      await NotificationService.createAIAlert(userId);
    }
  } catch (error) {
    console.error("[AI Assistant] Error triggering AI wellness alert:", error);
  }

  if (!GROQ_API_KEY) {
    throw new Error("GROQ_API_KEY is not configured.");
  }

  const analytics = await getDashboardAnalytics(userId);
  const latestAssessment = await getLatestAssessment(userId).catch(() => null);
  const wellnessContext = buildContextSummary(student, analytics, latestAssessment);
  const conversation = buildConversationMessages(conversationMessages);

  const systemMessages = [
    { role: "system", content: SYSTEM_PROMPT },
    { role: "system", content: wellnessContext },
  ];

  const payload = {
    model: GROQ_MODEL,
    messages: [
      ...systemMessages,
      ...conversation,
      { role: "user", content: userMessage.trim() },
    ],
    temperature: 0.7,
    max_tokens: 512,
    top_p: 0.95,
  };

  const response = await fetch(GROQ_API_URL, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${GROQ_API_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  });

  const aiText = await extractGroqResponse(response);
  return aiText;
};
