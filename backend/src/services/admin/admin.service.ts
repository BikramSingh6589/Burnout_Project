import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { Admin } from "../../models/Admin.js";
import { Student } from "../../models/Student.js";
import { Assessment } from "../../models/Assessment.js";
import { WeeklyAssessment } from "../../models/WeeklyAssessment.js";
import { InitialAssessment } from "../../models/InitialAssessment.js";
import { DailyAssessment } from "../../models/DailyAssessment.js";
import { Journal } from "../../models/Journal.js";
import { config } from "../../config/env.js";
import {
  getWellnessEmailTemplate,
  sendWellnessTemplateEmail,
  sendJustLoggedInReminder,
  sendOnlyInitialReminder,
  sendStreakMaintainerReminder,
  type WellnessRiskTier,
} from "../../utils/email.js";
import { Types } from "mongoose";
import { RiskLevel } from "../../types/common.types.js";
import { AppError } from "../../middlewares/error.middleware.js";

export interface AdminLoginRequest {
  username: string;
  password: string;
}

export interface AdminLoginResponse {
  token: string;
  admin: {
    id: string;
    username: string;
  };
}

export interface DashboardMetrics {
  totalStudents: number;
  totalAssessments: number;
  lowRiskStudents: number;
  mediumRiskStudents: number;
  highRiskStudents: number;
  averageBurnoutScore: number;
  weeklyActiveStudents?: number;
}

export interface StudentInfo {
  id: string;
  name: string;
  email: string;
  burnoutScore: number;
  riskLevel: "LOW" | "MEDIUM" | "HIGH";
  sleepHoursAvg?: number;
  stressLevelAvg?: number;
  moodTrend?: "Positive" | "Neutral" | "Negative";
  lastAssessmentDate?: Date;
}

const mapRiskLevelToApi = (level?: string | null): "LOW" | "MEDIUM" | "HIGH" => {
  const key = (level || "").toLowerCase();
  if (key === RiskLevel.High) return "HIGH";
  if (key === RiskLevel.Moderate) return "MEDIUM";
  return "LOW";
};

const mapRiskLevelToTier = (level?: string | null): WellnessRiskTier => {
  const key = (level || "").toLowerCase();
  if (key === RiskLevel.High) return "high";
  if (key === RiskLevel.Moderate) return "moderate";
  return "low";
};

const riskSortPriority = (level: "LOW" | "MEDIUM" | "HIGH"): number => {
  if (level === "HIGH") return 0;
  if (level === "MEDIUM") return 1;
  return 2;
};

const calculateMoodTrendFromJournals = (
  journals: Array<{ sentiment?: string }>
): "Positive" | "Neutral" | "Negative" => {
  if (journals.length === 0) return "Neutral";

  let positive = 0;
  let negative = 0;

  journals.forEach((entry) => {
    const sentiment = (entry.sentiment || "").toLowerCase();
    if (sentiment === "positive") positive += 1;
    else if (sentiment === "negative") negative += 1;
  });

  const total = journals.length;
  if (negative / total > 0.5) return "Negative";
  if (positive / total > 0.5) return "Positive";
  return "Neutral";
};

export const loginAdmin = async (credentials: AdminLoginRequest): Promise<AdminLoginResponse> => {
  const admin = await Admin.findOne({ username: credentials.username }).select("+password");

  if (!admin) {
    throw new AppError("Invalid credentials", 401);
  }

  const isValidPassword = await bcrypt.compare(credentials.password, admin.password);
  if (!isValidPassword) {
    throw new AppError("Invalid credentials", 401);
  }

  const token = jwt.sign(
    { adminId: admin._id.toString(), role: "admin" },
    config.jwtSecret,
    { expiresIn: "24h" }
  );

  await Admin.updateOne({ _id: admin._id }, { lastLoginAt: new Date() });

  return {
    token,
    admin: {
      id: admin._id.toString(),
      username: admin.username,
    },
  };
};

export const getDashboardMetrics = async (): Promise<DashboardMetrics> => {
  const [totalStudents, riskCountsResult, avgScoreResult, assessmentCount, dailyCount, weeklyCount, initialCount] = await Promise.all([
    Student.countDocuments({}),
    Student.aggregate([
      {
        $group: {
          _id: "$currentRiskLevel",
          count: { $sum: 1 },
        },
      },
    ]),
    Student.aggregate([
      {
        $match: {
          currentBurnoutScore: { $exists: true, $ne: null },
        },
      },
      {
        $group: {
          _id: null,
          averageBurnoutScore: { $avg: "$currentBurnoutScore" },
        },
      },
    ]),
    Assessment.countDocuments({}),
    DailyAssessment.countDocuments({}),
    WeeklyAssessment.countDocuments({}),
    InitialAssessment.countDocuments({}),
  ]);
  const totalAssessments = assessmentCount + dailyCount + weeklyCount + initialCount;

  const riskCounts = {
    LOW: 0,
    MEDIUM: 0,
    HIGH: 0,
  };

  riskCountsResult.forEach((item: { _id?: string; count: number }) => {
    const key = (item._id || "").toString().toLowerCase();
    if (key === RiskLevel.High) riskCounts.HIGH = item.count;
    else if (key === RiskLevel.Moderate) riskCounts.MEDIUM = item.count;
    else riskCounts.LOW = item.count;
  });

  const averageBurnoutScore =
    avgScoreResult.length > 0 ? Math.round(avgScoreResult[0].averageBurnoutScore) : 0;

  const sevenDaysAgo = new Date();
  sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

  const recentAssessmentIds = await Assessment.distinct("student", { createdAt: { $gte: sevenDaysAgo } });
  const recentWeeklyIds = await WeeklyAssessment.distinct("student", { createdAt: { $gte: sevenDaysAgo } });
  const uniqueIds = new Set<string>([...recentAssessmentIds.map(String), ...recentWeeklyIds.map(String)]);

  return {
    totalStudents,
    totalAssessments,
    lowRiskStudents: riskCounts.LOW,
    mediumRiskStudents: riskCounts.MEDIUM,
    highRiskStudents: riskCounts.HIGH,
    averageBurnoutScore,
    weeklyActiveStudents: uniqueIds.size,
  };
};

export const getAllStudents = async (
  page: number = 1,
  limit: number = 20
): Promise<{ students: StudentInfo[]; total: number }> => {
  const allStudents = await Student.find({}).lean();
  const total = allStudents.length;

  const studentIds = allStudents.map((s) => new Types.ObjectId(String(s._id)));

  const [assessments, weeklyAssessments, journals] = await Promise.all([
    Assessment.find({ student: { $in: studentIds } }).sort({ createdAt: -1 }).lean(),
    WeeklyAssessment.find({ student: { $in: studentIds } }).sort({ createdAt: -1 }).lean(),
    Journal.find({ studentId: { $in: studentIds } }).lean(),
  ]);

  const assessmentMap = new Map<string, (typeof assessments)[number]>();
  assessments.forEach((a) => {
    const key = a.student.toString();
    if (!assessmentMap.has(key)) assessmentMap.set(key, a);
  });

  const weeklyMap = new Map<string, (typeof weeklyAssessments)[number][]>();
  weeklyAssessments.forEach((w) => {
    const key = w.student.toString();
    if (!weeklyMap.has(key)) weeklyMap.set(key, []);
    weeklyMap.get(key)!.push(w);
  });

  const journalMap = new Map<string, (typeof journals)[number][]>();
  journals.forEach((j) => {
    const key = j.studentId.toString();
    if (!journalMap.has(key)) journalMap.set(key, []);
    journalMap.get(key)!.push(j);
  });

  const studentInfos: StudentInfo[] = allStudents.map((student) => {
    const studentId = student._id.toString();
    const assessment = assessmentMap.get(studentId);
    const weeklyForStudent = weeklyMap.get(studentId) || [];
    const journalsForStudent = journalMap.get(studentId) || [];

    const score = Math.round(student.currentBurnoutScore ?? 0);
    const riskLevel = mapRiskLevelToApi(student.currentRiskLevel);

    const sleepValues: number[] = [];
    const stressValues: number[] = [];

    if (assessment) {
      if (typeof assessment.sleepHours === "number") sleepValues.push(assessment.sleepHours);
      if (typeof assessment.stressLevel === "number") stressValues.push(assessment.stressLevel);
    }

    weeklyForStudent.forEach((w) => {
      if (typeof w.sleepHoursAverage === "number") sleepValues.push(w.sleepHoursAverage);
      else if (typeof w.sleepHours === "number") sleepValues.push(w.sleepHours);
      if (typeof w.stressLevel === "number") stressValues.push(w.stressLevel);
      else if (typeof w.stressScore === "number") stressValues.push(Math.round(w.stressScore / 10));
    });

    const sleepAvg =
      sleepValues.length > 0
        ? Math.round((sleepValues.reduce((a, b) => a + b, 0) / sleepValues.length) * 10) / 10
        : 0;
    const stressAvg =
      stressValues.length > 0
        ? Math.round((stressValues.reduce((a, b) => a + b, 0) / stressValues.length) * 10) / 10
        : 0;

    const moodTrend = calculateMoodTrendFromJournals(journalsForStudent);

    const assessmentDate = assessment?.createdAt ? new Date(assessment.createdAt) : null;
    const weeklyDate =
      weeklyForStudent.length > 0 && weeklyForStudent[0].createdAt
        ? new Date(weeklyForStudent[0].createdAt)
        : null;

    let lastAssessmentDate: Date | undefined;
    if (assessmentDate && weeklyDate) {
      lastAssessmentDate = assessmentDate > weeklyDate ? assessmentDate : weeklyDate;
    } else {
      lastAssessmentDate = assessmentDate ?? weeklyDate ?? undefined;
    }

    return {
      id: studentId,
      name: student.fullName || "Unknown",
      email: student.email,
      burnoutScore: score,
      riskLevel,
      lastAssessmentDate,
      sleepHoursAvg: sleepAvg,
      stressLevelAvg: stressAvg,
      moodTrend,
    };
  });

  studentInfos.sort((a, b) => {
    const riskDiff = riskSortPriority(a.riskLevel) - riskSortPriority(b.riskLevel);
    if (riskDiff !== 0) return riskDiff;
    return b.burnoutScore - a.burnoutScore;
  });

  const skip = (page - 1) * limit;
  const paginatedStudents = studentInfos.slice(skip, skip + limit);

  return { students: paginatedStudents, total };
};

export const getHighRiskStudents = async (
  page: number = 1,
  limit: number = 20
): Promise<{ students: StudentInfo[]; total: number }> => {
  const skip = (page - 1) * limit;

  const [students, total] = await Promise.all([
    Student.find({ currentRiskLevel: RiskLevel.High })
      .sort({ currentBurnoutScore: -1, createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .lean(),
    Student.countDocuments({ currentRiskLevel: RiskLevel.High }),
  ]);

  const studentInfos: StudentInfo[] = students.map((student) => ({
    id: student._id.toString(),
    name: student.fullName || "Unknown",
    email: student.email,
    burnoutScore: Math.round(student.currentBurnoutScore ?? 0),
    riskLevel: "HIGH",
  }));

  return { students: studentInfos, total };
};

export const getStudentDetail = async (studentId: string) => {
  const student = await Student.findById(studentId).lean();
  if (!student) {
    throw new AppError("Student not found", 404);
  }

  const [assessments, weeklyAssessments, initialAssessments, dailyAssessments] = await Promise.all([
    Assessment.find({ student: studentId }).sort({ createdAt: -1 }).lean(),
    WeeklyAssessment.find({ student: studentId }).sort({ createdAt: -1 }).lean(),
    InitialAssessment.find({ student: studentId }).sort({ createdAt: -1 }).lean(),
    DailyAssessment.find({ student: studentId }).sort({ createdAt: -1 }).lean(),
  ]);

  const score = Math.round(student.currentBurnoutScore ?? 0);
  const riskLevel = mapRiskLevelToApi(student.currentRiskLevel);

  const combinedAssessments = [
    ...assessments.map((a) => ({
      date: a.createdAt,
      type: "standard",
      score: a.burnoutScore,
    })),
    ...weeklyAssessments.map((w) => ({
      date: w.createdAt,
      type: "weekly",
      score: w.burnoutScore,
    })),
    ...initialAssessments.map((i) => ({
      date: i.createdAt,
      type: "initial",
      score: i.baselineBurnoutScore,
    })),
    ...dailyAssessments.map((d) => ({
      date: d.createdAt,
      type: "daily",
      score: d.burnoutScore,
    })),
  ].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  const latestAssessmentDate = combinedAssessments[0]?.date ?? student.updatedAt;

  return {
    profile: {
      id: student._id.toString(),
      name: student.fullName,
      email: student.email,
      registeredAt: student.createdAt,
    },
    burnout: {
      currentScore: score,
      riskLevel,
      lastUpdated: latestAssessmentDate,
    },
    assessments: combinedAssessments,
    totalAssessments: combinedAssessments.length,
  };
};

export const sendWellnessEmail = async (studentId: string): Promise<void> => {
  const student = await Student.findById(studentId).lean();
  if (!student) {
    throw new AppError("Student not found", 404);
  }

  const tier = mapRiskLevelToTier(student.currentRiskLevel);
  const template = getWellnessEmailTemplate(tier, student.fullName);

  await sendWellnessTemplateEmail(student.email, template);
};

export const sendBulkWellnessEmail = async (
  riskGroup: WellnessRiskTier
): Promise<{ sent: number; recipients: string[] }> => {
  const riskLevel =
    riskGroup === "high"
      ? RiskLevel.High
      : riskGroup === "moderate"
      ? RiskLevel.Moderate
      : RiskLevel.Low;

  const students = await Student.find({ currentRiskLevel: riskLevel }).lean();

  if (students.length === 0) {
    return { sent: 0, recipients: [] };
  }

  const recipients: string[] = [];

  for (const student of students) {
    const template = getWellnessEmailTemplate(riskGroup, student.fullName);
    await sendWellnessTemplateEmail(student.email, template);
    recipients.push(student.email);
  }

  return { sent: students.length, recipients };
};

export const seedDefaultAdmin = async (): Promise<void> => {
  const existingAdmin = await Admin.findOne({ username: "admin" });

  if (existingAdmin) {
    return;
  }

  const hashedPassword = await bcrypt.hash("admin123", 10);

  await Admin.create({
    username: "admin",
    password: hashedPassword,
  });

  console.log("[Admin Seed] Default admin account created successfully");
};

// --- Assessment Reminder Functions ---

export const sendBulkJustLoggedInReminders = async (): Promise<{ sent: number; recipients: string[] }> => {
  const students = await Student.find({}).lean();
  const recipients: string[] = [];

  for (const student of students) {
    const initialCount = await InitialAssessment.countDocuments({ student: student._id });
    const dailyCount = await DailyAssessment.countDocuments({ student: student._id });
    const weeklyCount = await WeeklyAssessment.countDocuments({ student: student._id });
    const standardCount = await Assessment.countDocuments({ student: student._id });
    const totalAssessments = initialCount + dailyCount + weeklyCount + standardCount;

    if (totalAssessments === 0) {
      try {
        await sendJustLoggedInReminder(student.email, student.fullName || "Student");
        recipients.push(student.email);
      } catch (err) {
        console.error(`[Admin] Failed to send just logged in reminder to ${student.email}:`, err);
      }
    }
  }

  return { sent: recipients.length, recipients };
};

export const sendBulkOnlyInitialReminders = async (): Promise<{ sent: number; recipients: string[] }> => {
    const students = await Student.find({}).lean();
    const recipients: string[] = [];

    for (const student of students) {
      const initialCount = await InitialAssessment.countDocuments({ student: student._id });
      const dailyCount = await DailyAssessment.countDocuments({ student: student._id });
      const weeklyCount = await WeeklyAssessment.countDocuments({ student: student._id });
      const standardCount = await Assessment.countDocuments({ student: student._id });
      const totalAssessments = initialCount + dailyCount + weeklyCount + standardCount;

      if (totalAssessments === 1) { // Any type, as long as exactly 1 total
        try {
          await sendOnlyInitialReminder(student.email, student.fullName || "Student");
          recipients.push(student.email);
        } catch (err) {
          console.error(`[Admin] Failed to send only initial reminder to ${student.email}:`, err);
        }
      }
    }

    return { sent: recipients.length, recipients };
  };

export const sendBulkStreakMaintainerReminders = async (): Promise<{ sent: number; recipients: string[] }> => {
  const students = await Student.find({}).lean();
  const recipients: string[] = [];

  for (const student of students) {
    const initialCount = await InitialAssessment.countDocuments({ student: student._id });
    const dailyCount = await DailyAssessment.countDocuments({ student: student._id });
    const weeklyCount = await WeeklyAssessment.countDocuments({ student: student._id });
    const standardCount = await Assessment.countDocuments({ student: student._id });
    const totalAssessments = initialCount + dailyCount + weeklyCount + standardCount;

    if (totalAssessments >= 2) {
      try {
        await sendStreakMaintainerReminder(student.email, student.fullName || "Student");
        recipients.push(student.email);
      } catch (err) {
        console.error(`[Admin] Failed to send streak maintainer reminder to ${student.email}:`, err);
      }
    }
  }

  return { sent: recipients.length, recipients };
};
