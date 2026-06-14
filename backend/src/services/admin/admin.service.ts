import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { Admin } from "../../models/Admin.js";
import { Student } from "../../models/Student.js";
import { BurnoutPrediction } from "../../models/BurnoutPrediction.js";
import { Assessment } from "../../models/Assessment.js";
import { WeeklyAssessment } from "../../models/WeeklyAssessment.js";
import { Journal } from "../../models/Journal.js";
import { Recommendation } from "../../models/Recommendation.js";
import { config } from "../../config/env.js";
import { sendSupportEmail } from "../../utils/email.js";
import { Types } from "mongoose";
import { RiskLevel } from "../../types/common.types.js";

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

export const loginAdmin = async (credentials: AdminLoginRequest): Promise<AdminLoginResponse> => {
  const admin = await Admin.findOne({ username: credentials.username }).select("+password");

  if (!admin) {
    throw new Error("Invalid credentials");
  }

  const isValidPassword = await bcrypt.compare(credentials.password, admin.password);
  if (!isValidPassword) {
    throw new Error("Invalid credentials");
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
  const [totalStudents, totalAssessments, riskCountsResult, avgScoreResult] = await Promise.all([
    Student.countDocuments({}),
    Assessment.countDocuments({}),
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
  ]);

  const riskCounts = {
    LOW: 0,
    MEDIUM: 0,
    HIGH: 0,
  };

  riskCountsResult.forEach((item: any) => {
    const key = (item._id || "").toString().toLowerCase();
    if (key === RiskLevel.High) riskCounts.HIGH = item.count;
    else if (key === RiskLevel.Moderate) riskCounts.MEDIUM = item.count;
    else riskCounts.LOW = item.count;
  });

  const averageBurnoutScore =
    avgScoreResult.length > 0 ? Math.round(avgScoreResult[0].averageBurnoutScore) : 0;
  // Compute weekly active students (students with at least one assessment or weekly assessment in last 7 days)
  const sevenDaysAgo = new Date();
  sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

  const recentAssessmentIds = await Assessment.distinct('student', { createdAt: { $gte: sevenDaysAgo } });
  const recentWeeklyIds = await WeeklyAssessment.distinct('student', { createdAt: { $gte: sevenDaysAgo } });
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
  const skip = (page - 1) * limit;

  const students = await Student.find({}).sort({ createdAt: -1 }).skip(skip).limit(limit).lean();

  const total = await Student.countDocuments({});

  const studentIds = students.map((s: any) => new Types.ObjectId(s._id));
  const predictions = await BurnoutPrediction.find({ student: { $in: studentIds } })
    .sort({ createdAt: -1 })
    .lean();

  const assessments = await Assessment.find({ student: { $in: studentIds } })
    .sort({ createdAt: -1 })
    .lean();

  const weeklyAssessments = await WeeklyAssessment.find({ student: { $in: studentIds } })
    .sort({ createdAt: -1 })
    .lean();

  const journals = await Journal.find({ studentId: { $in: studentIds } }).lean();

  const predictionMap = new Map();
  predictions.forEach((p: any) => {
    if (!predictionMap.has(p.student.toString())) {
      predictionMap.set(p.student.toString(), p);
    }
  });

  const assessmentMap = new Map();
  assessments.forEach((a: any) => {
    if (!assessmentMap.has(a.student.toString())) {
      assessmentMap.set(a.student.toString(), a);
    }
  });

  const weeklyMap = new Map();
  weeklyAssessments.forEach((w: any) => {
    const key = w.student?.toString ? w.student.toString() : (w.studentId ? String(w.studentId) : null);
    if (!key) return;
    if (!weeklyMap.has(key)) weeklyMap.set(key, []);
    weeklyMap.get(key).push(w);
  });

  const journalMap = new Map();
  journals.forEach((j: any) => {
    const key = j.studentId.toString();
    if (!journalMap.has(key)) journalMap.set(key, []);
    journalMap.get(key).push(j);
  });

  const studentInfos: StudentInfo[] = students.map((student: any) => {
    const prediction = predictionMap.get(student._id.toString());
    const assessment = assessmentMap.get(student._id.toString());
    const score = prediction?.predictedScore || 0;

    // compute averages from weekly assessments + latest assessment if present
    const weeklyForStudent = weeklyMap.get(student._id.toString()) || [];
    const sleepValues: number[] = [];
    const stressValues: number[] = [];
    const moodValues: number[] = [];

    if (assessment) {
      if (typeof assessment.sleepHours === 'number') sleepValues.push(assessment.sleepHours);
      if (typeof assessment.stressLevel === 'number') stressValues.push(assessment.stressLevel);
      if (typeof assessment.moodScore === 'number') moodValues.push(assessment.moodScore);
    }

    weeklyForStudent.forEach((w: any) => {
      if (typeof w.sleepHours === 'number') sleepValues.push(w.sleepHours);
      if (typeof w.sleepHoursAverage === 'number') sleepValues.push(w.sleepHoursAverage);
      if (typeof w.stressScore === 'number') stressValues.push(Math.round(w.stressScore / 10));
      if (typeof w.moodScore === 'number') moodValues.push(w.moodScore);
      if (typeof w.stressLevel === 'number') stressValues.push(w.stressLevel);
    });

    const sleepAvg = sleepValues.length > 0 ? Math.round((sleepValues.reduce((a, b) => a + b, 0) / sleepValues.length) * 10) / 10 : 0;
    const stressAvg = stressValues.length > 0 ? Math.round((stressValues.reduce((a, b) => a + b, 0) / stressValues.length) * 10) / 10 : 0;

    // simple mood trend calculation
    const moodAvg = moodValues.length > 0 ? moodValues.reduce((a, b) => a + b, 0) / moodValues.length : 0;
    let moodTrend: 'Positive' | 'Neutral' | 'Negative' = 'Neutral';
    if (moodAvg >= 60) moodTrend = 'Positive';
    else if (moodAvg <= 40) moodTrend = 'Negative';

    // journal sentiment summary
    const journalsForStudent = journalMap.get(student._id.toString()) || [];
    const totalJ = journalsForStudent.length;
    const negativeCount = journalsForStudent.filter((j: any) => j.sentiment === 'negative').length;
    const positiveCount = journalsForStudent.filter((j: any) => j.sentiment === 'positive').length;
    let sentimentSummary = 'Neutral';
    if (negativeCount > positiveCount && negativeCount / Math.max(1, totalJ) >= 0.5) sentimentSummary = 'Mostly Negative';
    else if (positiveCount > negativeCount && positiveCount / Math.max(1, totalJ) >= 0.5) sentimentSummary = 'Mostly Positive';

    let riskLevel: "LOW" | "MEDIUM" | "HIGH" = "LOW";
    if (score >= 70) riskLevel = "HIGH";
    else if (score >= 40) riskLevel = "MEDIUM";

    const lastAssessmentDate = assessment?.createdAt || (weeklyForStudent[0] && weeklyForStudent[0].createdAt) || null;

    return {
      id: student._id.toString(),
      name: student.fullName || "Unknown",
      email: student.email,
      burnoutScore: Math.round(score),
      riskLevel,
      lastAssessmentDate,
      sleepHoursAvg: sleepAvg,
      stressLevelAvg: stressAvg,
      journalSentimentSummary: sentimentSummary,
    };
  });

  return { students: studentInfos, total };
};

export const getHighRiskStudents = async (
  page: number = 1,
  limit: number = 20
): Promise<{ students: StudentInfo[]; total: number }> => {
  const skip = (page - 1) * limit;

  const highRiskPredictions = await BurnoutPrediction.find({ predictedScore: { $gte: 70 } })
    .sort({ predictedScore: -1, createdAt: -1 })
    .skip(skip)
    .limit(limit)
    .lean();

  const total = await BurnoutPrediction.countDocuments({ predictedScore: { $gte: 70 } });

  const studentIds = highRiskPredictions.map((p: any) => p.studentId);
  const students = await Student.find({ _id: { $in: studentIds } }).lean();

  const studentMap = new Map();
  students.forEach((s: any) => {
    studentMap.set(s._id.toString(), s);
  });

  const studentInfos: StudentInfo[] = highRiskPredictions.map((pred: any) => {
    const student = studentMap.get(pred.student.toString());
    return {
      id: pred.student.toString(),
      name: student?.fullName || "Unknown",
      email: student?.email || "unknown@example.com",
      burnoutScore: Math.round(pred.predictedScore),
      riskLevel: "HIGH",
    };
  });

  return { students: studentInfos, total };
};

export const getStudentDetail = async (studentId: string) => {
  const student = await Student.findById(studentId).lean();
  if (!student) {
    throw new Error("Student not found");
  }

  const prediction = await BurnoutPrediction.findOne({ student: studentId }).sort({ createdAt: -1 }).lean();

  const assessments = await Assessment.find({ student: studentId }).sort({ createdAt: -1 }).lean();

  const score = prediction?.predictedScore ?? 0;
  const riskLevel =
    score >= 70 ? "HIGH" : score >= 40 ? "MEDIUM" : "LOW";

  return {
    profile: {
      id: student._id.toString(),
      name: student.fullName,
      email: student.email,
      registeredAt: student.createdAt,
    },
    burnout: {
      currentScore: Math.round(score),
      riskLevel,
      lastUpdated: prediction?.createdAt,
    },
    assessments: assessments.map((a: any) => ({
      date: a.createdAt,
      type: a.type,
      score: a.predictedScore || 0,
    })),
    totalAssessments: assessments.length,
  };
};

export const sendWellnessEmail = async (studentId: string, subject: string, message: string): Promise<void> => {
  const student = await Student.findById(studentId).lean();
  if (!student) {
    throw new Error("Student not found");
  }

  await sendSupportEmail(student.email, student.fullName, subject, message);
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
