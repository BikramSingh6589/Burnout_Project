import { Journal, type IJournal } from "../../models/Journal.js";
import { Types } from "mongoose";
import { analyzeSentiment } from "./sentiment.service.js";

export class JournalError extends Error {
  statusCode: number;

  constructor(message: string, statusCode = 400) {
    super(message);
    this.statusCode = statusCode;
  }
}

export const createJournal = async (
  studentId: string,
  content: string
): Promise<IJournal> => {
  const sentiment = await analyzeSentiment(content);

  const journal = await Journal.create({
    studentId: new Types.ObjectId(studentId),
    content: content.trim(),
    sentiment,
  });

  return journal;
};

export const getJournals = async (studentId: string): Promise<IJournal[]> => {
  const journals = await Journal.find({
    studentId: new Types.ObjectId(studentId),
  }).sort({ createdAt: -1 });

  return journals;
};

export const deleteJournal = async (
  journalId: string,
  studentId: string
): Promise<void> => {
  if (!Types.ObjectId.isValid(journalId)) {
    throw new JournalError("Invalid journal ID", 400);
  }

  const journal = await Journal.findOne({
    _id: new Types.ObjectId(journalId),
    studentId: new Types.ObjectId(studentId),
  });

  if (!journal) {
    throw new JournalError("Journal not found or access denied", 404);
  }

  await Journal.deleteOne({
    _id: new Types.ObjectId(journalId),
  });
};

export const analyzeBurnoutRisk = async (
  studentId: string
): Promise<{
  riskLevel: 'high' | 'moderate' | 'low';
  negativeRatio: number;
  totalEntries: number;
  negativeEntries: number;
  period: string;
}> => {
  const sevenDaysAgo = new Date();
  sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

  const journals = await Journal.find({
    studentId: new Types.ObjectId(studentId),
    createdAt: { $gte: sevenDaysAgo },
  });

  const totalEntries = journals.length;
  const negativeEntries = journals.filter((j) => j.sentiment === 'negative').length;
  const negativeRatio = totalEntries > 0 ? (negativeEntries / totalEntries) * 100 : 0;

  let riskLevel: 'high' | 'moderate' | 'low';
  if (negativeRatio > 70) {
    riskLevel = 'high';
  } else if (negativeRatio >= 40) {
    riskLevel = 'moderate';
  } else {
    riskLevel = 'low';
  }

  return {
    riskLevel,
    negativeRatio: Math.round(negativeRatio),
    totalEntries,
    negativeEntries,
    period: 'last 7 days',
  };
};
