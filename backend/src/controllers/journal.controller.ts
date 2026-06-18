import type { NextFunction, Request, Response } from "express";
import { MoodJournal } from "../models/MoodJournal.js";
import { Mood } from "../types/common.types.js";
import { Types } from "mongoose";

export const getJournalEntries = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ success: false, message: "Unauthorized access" });
      return;
    }

    const entries = await MoodJournal.find({
      student: new Types.ObjectId(req.user.userId.toString()),
    })
      .sort({ journaledAt: -1 })
      .select("mood moodScore energyLevel stressLevel notes sentimentScore tags journaledAt")
      .lean();

    res.status(200).json({
      success: true,
      data: entries,
    });
  } catch (error) {
    next(error);
  }
};

export const createJournalEntry = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ success: false, message: "Unauthorized access" });
      return;
    }

    const { content } = req.body;
    if (!content || typeof content !== "string" || !content.trim()) {
      res.status(400).json({ success: false, message: "Journal content is required" });
      return;
    }

    const contentLower = content.toLowerCase();
    let sentiment: "Positive" | "Neutral" | "Negative" = "Neutral";
    let negativePoints = 0;
    let positivePoints = 0;

    const negativeKeywords = [
      "tired", "stressed", "exhausted", "overwhelmed", "sad", "angry", "fail",
      "bad", "hard", "stuck", "sleepy", "insomnia", "procrastinating", "backlog"
    ];
    const positiveKeywords = [
      "happy", "productive", "good", "refreshed", "exercise", "relax", "fun",
      "completed", "progress", "sleep well", "motivated", "excited"
    ];

    negativeKeywords.forEach((word) => {
      if (contentLower.includes(word)) negativePoints++;
    });

    positiveKeywords.forEach((word) => {
      if (contentLower.includes(word)) positivePoints++;
    });

    let mood = Mood.Neutral;
    let moodScore = 50;
    let energyLevel = 50;
    let stressLevel = 50;
    let sentimentScore = 0.0;

    if (negativePoints > positivePoints) {
      sentiment = "Negative";
      mood = Mood.Low;
      moodScore = 30;
      energyLevel = 40;
      stressLevel = 70;
      sentimentScore = -0.6;
    } else if (positivePoints > negativePoints) {
      sentiment = "Positive";
      mood = Mood.Good;
      moodScore = 80;
      energyLevel = 80;
      stressLevel = 20;
      sentimentScore = 0.6;
    }

    const newEntry = new MoodJournal({
      student: new Types.ObjectId(req.user.userId.toString()),
      mood,
      moodScore,
      energyLevel,
      stressLevel,
      notes: content.trim(),
      sentimentScore,
      tags: sentiment === "Positive" ? ["positive"] : sentiment === "Negative" ? ["negative"] : ["neutral"],
      journaledAt: new Date(),
    });

    const savedEntry = await newEntry.save();

    res.status(201).json({
      success: true,
      data: savedEntry,
    });
  } catch (error) {
    next(error);
  }
};

export const deleteJournalEntry = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ success: false, message: "Unauthorized access" });
      return;
    }

    const { id } = req.params;
    if (!Types.ObjectId.isValid(id)) {
      res.status(400).json({ success: false, message: "Invalid entry ID" });
      return;
    }

    const deletedEntry = await MoodJournal.findOneAndDelete({
      _id: new Types.ObjectId(id),
      student: new Types.ObjectId(req.user.userId.toString()),
    });

    if (!deletedEntry) {
      res.status(404).json({ success: false, message: "Journal entry not found" });
      return;
    }

    res.status(200).json({
      success: true,
      message: "Journal entry deleted successfully",
    });
  } catch (error) {
    next(error);
  }
};
