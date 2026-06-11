import { Types } from "mongoose";
import { Assessment } from "../../models/Assessment.js";
import { Journal } from "../../models/Journal.js";
import { Recommendation, type IRecommendation } from "../../models/Recommendation.js";
import { RecommendationFeedback, type IRecommendationFeedback } from "../../models/RecommendationFeedback.js";
import { Student } from "../../models/Student.js";
import { StudentRecommendation, type IStudentRecommendation } from "../../models/StudentRecommendation.js";
import { WeeklyAssessment } from "../../models/WeeklyAssessment.js";
import type { AssessmentRequestBody, WeeklyAssessmentRequestBody } from "../../types/assessment.types.js";
import { RecommendationStatus } from "../../types/common.types.js";
import { RECOMMENDATION_DASHBOARD_LIMIT, RECOMMENDATION_PRIORITY_ORDER } from "./recommendation.constants.js";
import { getRecommendationEnhancer } from "./recommendation-ai-enhancer.js";
import { evaluateRecommendationRules } from "./recommendation-rules.js";
import type {
  GeneratedRecommendation,
  JournalSentimentSummary,
  RecommendationPriority,
  RecommendationWithFeedback,
} from "./recommendation.types.js";

const RECENT_JOURNAL_WINDOW_DAYS = 7;
const RECENT_JOURNAL_CONTEXT_LIMIT = 5;
const RECENT_JOURNAL_CONTENT_LIMIT = 700;
const BACKFILL_ASSESSMENT_LIMIT = 25;

const isObjectId = (value: string): boolean => Types.ObjectId.isValid(value);

const toObjectId = (value: string): Types.ObjectId => new Types.ObjectId(value);

const scoreToTenPointScale = (score: number): number => Math.round(Math.max(0, Math.min(100, score)) / 10);

export const mapWeeklyAssessmentToRecommendationSnapshot = (
  assessment: WeeklyAssessmentRequestBody,
): AssessmentRequestBody => ({
  stressLevel: scoreToTenPointScale(assessment.stressScore),
  academicSatisfaction: scoreToTenPointScale(assessment.concentrationScore),
  studyHours: Math.max(0, Math.min(12, 12 - scoreToTenPointScale(assessment.academicLoadScore))),
  backlog: scoreToTenPointScale(assessment.academicLoadScore),
  procrastination: scoreToTenPointScale(100 - assessment.concentrationScore),
  motivation: scoreToTenPointScale(assessment.motivationScore),
  energy: scoreToTenPointScale(100 - assessment.physicalFatigueScore),
  sleepHours: assessment.sleepHoursAverage,
  screenTime: 0,
});

const mapAssessmentToRecommendationSnapshot = (assessment: any): AssessmentRequestBody => ({
  stressLevel: assessment.stressLevel,
  academicSatisfaction: assessment.academicSatisfaction,
  studyHours: assessment.studyHours,
  backlog: assessment.backlog,
  procrastination: assessment.procrastination,
  motivation: assessment.motivation,
  energy: assessment.energy,
  sleepHours: assessment.sleepHours,
  screenTime: assessment.screenTime,
});

const sortByPriority = <T extends { priority: RecommendationPriority; createdAt?: Date | string }>(items: T[]): T[] => {
  return [...items].sort((left, right) => {
    const priorityDelta = RECOMMENDATION_PRIORITY_ORDER[left.priority] - RECOMMENDATION_PRIORITY_ORDER[right.priority];

    if (priorityDelta !== 0) {
      return priorityDelta;
    }

    const leftCreatedAt = left.createdAt ? new Date(left.createdAt).getTime() : 0;
    const rightCreatedAt = right.createdAt ? new Date(right.createdAt).getTime() : 0;

    return rightCreatedAt - leftCreatedAt;
  });
};

const buildJournalSentimentSummary = async (userId: string): Promise<JournalSentimentSummary> => {
  const windowStart = new Date();
  windowStart.setDate(windowStart.getDate() - RECENT_JOURNAL_WINDOW_DAYS);

  const recentEntries = await Journal.find({
    studentId: toObjectId(userId),
    createdAt: { $gte: windowStart },
  })
    .sort({ createdAt: -1 })
    .select({ sentiment: 1, content: 1, createdAt: 1 })
    .lean();

  const totalEntries = recentEntries.length;
  const negativeEntries = recentEntries.filter((entry) => entry.sentiment === "negative").length;
  const negativeRatio = totalEntries > 0 ? Math.round((negativeEntries / totalEntries) * 100) : 0;

  return {
    hasRecentNegativeSentiment: negativeEntries > 0,
    negativeRatio,
    totalEntries,
    negativeEntries,
    recentEntries: recentEntries.slice(0, RECENT_JOURNAL_CONTEXT_LIMIT).map((entry) => ({
      sentiment: entry.sentiment,
      content: entry.content.slice(0, RECENT_JOURNAL_CONTENT_LIMIT),
      createdAt: entry.createdAt.toISOString(),
    })),
  };
};

const mapFeedbackStatus = (status?: RecommendationStatus | null): RecommendationWithFeedback["followedStatus"] => {
  switch (status) {
    case RecommendationStatus.Completed:
      return "followed";
    case RecommendationStatus.InProgress:
      return "partially";
    case RecommendationStatus.Dismissed:
      return "not";
    default:
      return "none";
  }
};

const mapStatusToRecommendationStatus = (status: RecommendationWithFeedback["followedStatus"]): RecommendationStatus => {
  switch (status) {
    case "followed":
      return RecommendationStatus.Completed;
    case "partially":
      return RecommendationStatus.InProgress;
    case "not":
      return RecommendationStatus.Dismissed;
    default:
      return RecommendationStatus.Assigned;
  }
};

const mapRecommendationToView = (
  recommendation: any,
  studentRecommendation?: any,
  feedback?: any,
): RecommendationWithFeedback => {
  const followedStatus = mapFeedbackStatus(studentRecommendation?.status);

  return {
    id: recommendation._id.toString(),
    assessmentId: recommendation.assessmentId.toString(),
    category: recommendation.category,
    priority: recommendation.priority,
    title: recommendation.title,
    message: recommendation.message,
    source: recommendation.source ?? "rules",
    createdAt: recommendation.createdAt.toISOString(),
    followedStatus,
    rating: feedback?.rating ?? 0,
    feedbackText: feedback?.comment ?? "",
    dateGenerated: recommendation.createdAt.toISOString().split("T")[0],
  };
};

const getRecommendationCollectionQuery = (userId: string, assessmentId?: Types.ObjectId, approvedOnly = true) => {
  const query: Record<string, unknown> = {
    userId: toObjectId(userId),
    approved: approvedOnly ? true : { $in: [true, false] },
  };

  if (assessmentId) {
    query.assessmentId = assessmentId;
  }

  return query;
};

const getRecommendationViews = async (userId: string, assessmentId?: Types.ObjectId): Promise<RecommendationWithFeedback[]> => {
  const recommendations: any[] = await Recommendation.find(getRecommendationCollectionQuery(userId, assessmentId))
    .sort({ priority: 1, createdAt: -1 })
    .lean();

  if (recommendations.length === 0) {
    return [];
  }

  const recommendationIds = recommendations.map((recommendation) => recommendation._id);

  const studentRecommendations = await StudentRecommendation.find({
    student: toObjectId(userId),
    recommendation: { $in: recommendationIds },
  }).lean();

  const studentRecommendationMap = new Map<string, any>();
  for (const studentRecommendation of studentRecommendations) {
    studentRecommendationMap.set(studentRecommendation.recommendation.toString(), studentRecommendation);
  }

  const studentRecommendationIds = studentRecommendations.map((item) => item._id);

  const feedbackDocuments = await RecommendationFeedback.find({
    studentRecommendation: { $in: studentRecommendationIds },
  }).lean();

  const feedbackMap = new Map<string, any>();
  for (const feedback of feedbackDocuments) {
    feedbackMap.set(feedback.studentRecommendation.toString(), feedback);
  }

  return sortByPriority(
    recommendations.map((recommendation) => {
      const studentRecommendation = studentRecommendationMap.get(recommendation._id.toString());
      const feedback = studentRecommendation ? feedbackMap.get(studentRecommendation._id.toString()) : undefined;

      return mapRecommendationToView(recommendation, studentRecommendation, feedback);
    }),
  );
};

export const generateRecommendationCandidates = async (
  userId: string,
  assessment: AssessmentRequestBody,
): Promise<GeneratedRecommendation[]> => {
  const journalSentiment = await buildJournalSentimentSummary(userId);
  const ruleRecommendations = evaluateRecommendationRules({
    assessment,
    journalSentiment,
  });

  return getRecommendationEnhancer().enhance(ruleRecommendations, {
    userId,
    assessment,
    journalSentiment,
  });
};

export const generateAndStoreRecommendations = async (
  userId: string,
  assessmentId: string,
  assessment: AssessmentRequestBody,
): Promise<IRecommendation[]> => {
  if (!isObjectId(userId) || !isObjectId(assessmentId)) {
    return [];
  }

  const generatedRecommendations = await generateRecommendationCandidates(userId, assessment);

  if (generatedRecommendations.length === 0) {
    return [];
  }

  await Recommendation.bulkWrite(
    generatedRecommendations.map((recommendation) => ({
      updateOne: {
        filter: {
          userId: toObjectId(userId),
          assessmentId: toObjectId(assessmentId),
          category: recommendation.category,
          title: recommendation.title,
        },
        update: {
          $set: {
            priority: recommendation.priority,
            message: recommendation.message,
            source: recommendation.source ?? "rules",
            // AI recommendations require counselor approval; rules-based are auto-approved
            approved: recommendation.source === "AI" ? false : true,
          },
          $setOnInsert: {
            userId: toObjectId(userId),
            assessmentId: toObjectId(assessmentId),
            category: recommendation.category,
            title: recommendation.title,
          },
        },
        upsert: true,
      },
    })),
    { ordered: false },
  );

  return Recommendation.find({
    userId: toObjectId(userId),
    assessmentId: toObjectId(assessmentId),
  }).sort({ priority: 1, createdAt: -1 });
};

const hasRecommendationsForAssessment = async (userId: string, assessmentId: Types.ObjectId): Promise<boolean> => {
  const count = await Recommendation.countDocuments({
    userId: toObjectId(userId),
    assessmentId,
  });

  return count > 0;
};

export const ensureRecommendationsGeneratedForUser = async (userId: string): Promise<void> => {
  if (!isObjectId(userId)) {
    return;
  }

  const [assessments, weeklyAssessments] = await Promise.all([
    Assessment.find({ student: toObjectId(userId) })
      .sort({ completedAt: -1, createdAt: -1 })
      .limit(BACKFILL_ASSESSMENT_LIMIT)
      .lean(),
    WeeklyAssessment.find({ student: toObjectId(userId) })
      .sort({ completedAt: -1, createdAt: -1 })
      .limit(BACKFILL_ASSESSMENT_LIMIT)
      .lean(),
  ]);

  for (const assessment of assessments) {
    if (await hasRecommendationsForAssessment(userId, assessment._id)) {
      continue;
    }

    await generateAndStoreRecommendations(
      userId,
      assessment._id.toString(),
      mapAssessmentToRecommendationSnapshot(assessment),
    );
  }

  for (const assessment of weeklyAssessments) {
    if (await hasRecommendationsForAssessment(userId, assessment._id)) {
      continue;
    }

    await generateAndStoreRecommendations(
      userId,
      assessment._id.toString(),
      mapWeeklyAssessmentToRecommendationSnapshot(assessment),
    );
  }
};

export const getLatestRecommendations = async (userId: string, limit?: number): Promise<RecommendationWithFeedback[]> => {
  if (!isObjectId(userId)) {
    return [];
  }

  await ensureRecommendationsGeneratedForUser(userId);

  const latestRecommendation = await Recommendation.findOne({ userId: toObjectId(userId) })
    .sort({ createdAt: -1 })
    .select({ assessmentId: 1 })
    .lean();

  if (!latestRecommendation?.assessmentId) {
    return [];
  }

  const recommendations = await getRecommendationViews(userId, latestRecommendation.assessmentId);

  return typeof limit === "number" ? recommendations.slice(0, limit) : recommendations;
};

export const getRecommendationHistory = async (userId: string): Promise<RecommendationWithFeedback[]> => {
  if (!isObjectId(userId)) {
    return [];
  }

  await ensureRecommendationsGeneratedForUser(userId);

  return getRecommendationViews(userId);
};

export const getDashboardRecommendations = async (userId: string): Promise<RecommendationWithFeedback[]> => {
  return getLatestRecommendations(userId, RECOMMENDATION_DASHBOARD_LIMIT);
};

export const recordRecommendationFeedback = async (
  userId: string,
  recommendationId: string,
  status: RecommendationWithFeedback["followedStatus"],
  rating: number,
  feedbackText: string,
): Promise<void> => {
  if (!isObjectId(userId) || !isObjectId(recommendationId)) {
    throw new Error("Invalid recommendation identifier");
  }

  const recommendation = await Recommendation.findOne({
    _id: toObjectId(recommendationId),
    userId: toObjectId(userId),
  });

  if (!recommendation) {
    throw new Error("Recommendation not found");
  }

  const studentRecommendation = await StudentRecommendation.findOneAndUpdate(
    {
      student: toObjectId(userId),
      recommendation: recommendation._id,
    },
    {
      $set: {
        priority: recommendation.priority,
        personalizationReason: recommendation.message,
        status: mapStatusToRecommendationStatus(status),
      },
      $setOnInsert: {
        student: toObjectId(userId),
        recommendation: recommendation._id,
      },
    },
    { upsert: true, new: true },
  );

  if (!studentRecommendation) {
    throw new Error("Unable to persist recommendation feedback");
  }

  await RecommendationFeedback.findOneAndUpdate(
    { studentRecommendation: studentRecommendation._id },
    {
      student: toObjectId(userId),
      studentRecommendation: studentRecommendation._id,
      rating: Number.isFinite(rating) ? Math.max(1, Math.min(5, Math.round(rating))) : 5,
      helpful: status === "followed" || status === "partially",
      comment: feedbackText.trim(),
      submittedAt: new Date(),
    },
    { upsert: true, new: true },
  );
};

// ─── Admin / Counselor Queue Functions ───────────────────────────────────────

export interface PendingAiRecommendation {
  id: string;
  userId: string;
  assessmentId: string;
  studentName: string;
  studentEmail: string;
  category: string;
  priority: string;
  title: string;
  message: string;
  source: "AI" | "rules";
  createdAt: string;
}

export const getPendingAiRecommendations = async (): Promise<PendingAiRecommendation[]> => {
  const pending = await Recommendation.find({ source: "AI", approved: false })
    .sort({ createdAt: -1 })
    .lean();

  const results: PendingAiRecommendation[] = [];

  for (const rec of pending) {
    const student = await Student.findById(rec.userId).select({ fullName: 1, email: 1 }).lean();
    results.push({
      id: rec._id.toString(),
      userId: rec.userId.toString(),
      assessmentId: rec.assessmentId.toString(),
      studentName: student?.fullName ?? "Unknown",
      studentEmail: student?.email ?? "Unknown",
      category: rec.category,
      priority: rec.priority,
      title: rec.title,
      message: rec.message,
      source: rec.source,
      createdAt: rec.createdAt.toISOString(),
    });
  }

  return results;
};

export const approveRecommendation = async (recommendationId: string): Promise<void> => {
  if (!isObjectId(recommendationId)) {
    throw new Error("Invalid recommendation identifier");
  }

  const result = await Recommendation.findOneAndUpdate(
    { _id: toObjectId(recommendationId), source: "AI" },
    { $set: { approved: true } },
  );

  if (!result) {
    throw new Error("Recommendation not found or already approved");
  }
};

export interface EditApprovePayload {
  title?: string;
  message?: string;
  priority?: "high" | "medium" | "low";
  category?: string;
}

export const editAndApproveRecommendation = async (
  recommendationId: string,
  payload: EditApprovePayload,
): Promise<void> => {
  if (!isObjectId(recommendationId)) {
    throw new Error("Invalid recommendation identifier");
  }

  const updateFields: Record<string, unknown> = { approved: true };
  if (payload.title) updateFields.title = payload.title.trim().slice(0, 180);
  if (payload.message) updateFields.message = payload.message.trim().slice(0, 1000);
  if (payload.priority) updateFields.priority = payload.priority;
  if (payload.category) updateFields.category = payload.category;

  const result = await Recommendation.findOneAndUpdate(
    { _id: toObjectId(recommendationId), source: "AI" },
    { $set: updateFields },
  );

  if (!result) {
    throw new Error("Recommendation not found");
  }
};

export const rejectRecommendation = async (recommendationId: string): Promise<void> => {
  if (!isObjectId(recommendationId)) {
    throw new Error("Invalid recommendation identifier");
  }

  const result = await Recommendation.findOneAndDelete({
    _id: toObjectId(recommendationId),
    source: "AI",
    approved: false,
  });

  if (!result) {
    throw new Error("Recommendation not found or already approved");
  }
};
