import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { Admin } from "../../models/Admin.js";
import { Student } from "../../models/Student.js";
import { BurnoutPrediction } from "../../models/BurnoutPrediction.js";
import { Assessment } from "../../models/Assessment.js";
import { config } from "../../config/env.js";
import { Types } from "mongoose";

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
}

export interface StudentInfo {
  id: string;
  name: string;
  email: string;
  burnoutScore: number;
  riskLevel: "LOW" | "MEDIUM" | "HIGH";
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
  const [totalStudents, totalAssessments, allPredictions] = await Promise.all([
    Student.countDocuments({}),
    Assessment.countDocuments({}),
    BurnoutPrediction.find({}).lean(),
  ]);

  const riskCounts = {
    LOW: 0,
    MEDIUM: 0,
    HIGH: 0,
  };

  let totalScore = 0;

  allPredictions.forEach((pred: any) => {
    const score = pred.predictedScore || 0;
    totalScore += score;

    if (score >= 70) {
      riskCounts.HIGH++;
    } else if (score >= 40) {
      riskCounts.MEDIUM++;
    } else {
      riskCounts.LOW++;
    }
  });

  const averageBurnoutScore =
    allPredictions.length > 0 ? Math.round(totalScore / allPredictions.length) : 0;

  return {
    totalStudents,
    totalAssessments,
    lowRiskStudents: riskCounts.LOW,
    mediumRiskStudents: riskCounts.MEDIUM,
    highRiskStudents: riskCounts.HIGH,
    averageBurnoutScore,
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
  const predictions = await BurnoutPrediction.find({ studentId: { $in: studentIds } })
    .sort({ createdAt: -1 })
    .lean();

  const assessments = await Assessment.find({ studentId: { $in: studentIds } })
    .sort({ createdAt: -1 })
    .lean();

  const predictionMap = new Map();
  predictions.forEach((p: any) => {
    if (!predictionMap.has(p.studentId.toString())) {
      predictionMap.set(p.studentId.toString(), p);
    }
  });

  const assessmentMap = new Map();
  assessments.forEach((a: any) => {
    if (!assessmentMap.has(a.studentId.toString())) {
      assessmentMap.set(a.studentId.toString(), a);
    }
  });

  const studentInfos: StudentInfo[] = students.map((student: any) => {
    const prediction = predictionMap.get(student._id.toString());
    const assessment = assessmentMap.get(student._id.toString());
    const score = prediction?.predictedScore || 0;

    let riskLevel: "LOW" | "MEDIUM" | "HIGH" = "LOW";
    if (score >= 70) riskLevel = "HIGH";
    else if (score >= 40) riskLevel = "MEDIUM";

    return {
      id: student._id.toString(),
      name: student.fullName || "Unknown",
      email: student.email,
      burnoutScore: Math.round(score),
      riskLevel,
      lastAssessmentDate: assessment?.createdAt,
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
    const student = studentMap.get(pred.studentId.toString());
    return {
      id: pred.studentId.toString(),
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

  const prediction = await BurnoutPrediction.findOne({ studentId }).sort({ createdAt: -1 }).lean();

  const assessments = await Assessment.find({ studentId }).sort({ createdAt: -1 }).lean();

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

  if (!config.emailUser || !config.emailPassword) {
    throw new Error("Email service not configured");
  }

  const nodemailer = await import("nodemailer").then((m) => m.default);
  const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: config.emailUser,
      pass: config.emailPassword,
    },
  });

  const htmlContent = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h2 style="color: #4CAF50;">Wellness Support Message</h2>
      <p>Dear ${student.fullName},</p>
      <div style="background-color: #f5f5f5; padding: 15px; border-radius: 5px; margin: 20px 0;">
        <p style="margin: 0; white-space: pre-wrap;">${message}</p>
      </div>
      <p>Remember, your well-being is important. If you need additional support, please reach out to your counselor or support services.</p>
      <p>Best regards,<br/>Burnout Management System</p>
    </div>
  `;

  await transporter.sendMail({
    from: config.emailUser,
    to: student.email,
    subject: subject,
    html: htmlContent,
  });
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
