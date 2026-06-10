import type { NextFunction, Request, Response } from "express";
import { Student } from "../models/Student.js";
import { AIConversation } from "../models/AIConversation.js";
import { ConversationRole } from "../types/common.types.js";
import { Types } from "mongoose";

export const chatWithAI = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ success: false, message: "Unauthorized access" });
      return;
    }

    const userId = req.user.userId.toString();
    const student = await Student.findById(userId);

    if (!student) {
      res.status(404).json({ success: false, message: "Student profile not found" });
      return;
    }

    if (!student.assessmentCompleted) {
      res.status(403).json({
        success: false,
        message: "Please complete your initial assessment before accessing the Wellness AI Assistant.",
      });
      return;
    }

    const { message } = req.body;
    if (!message || typeof message !== "string" || !message.trim()) {
      res.status(400).json({ success: false, message: "Message content is required" });
      return;
    }

    // Retrieve or create AI Conversation
    let conversation = await AIConversation.findOne({
      student: new Types.ObjectId(userId),
    });

    if (!conversation) {
      conversation = new AIConversation({
        student: new Types.ObjectId(userId),
        sessionId: `session-${userId}-${Date.now()}`,
        messages: [
          {
            role: ConversationRole.Assistant,
            content: "Hi there! I'm your Wellness Assistant. I analyze your journal entries and weekly assessments to offer suggestions and monitor burnout. How are you feeling today?",
            createdAt: new Date(),
          },
        ],
      });
    }

    const userText = message.toLowerCase();
    let aiResponseText = "I see. Let's talk more about that. Sharing your feelings in your mood journal is also a great way to monitor your progress.";

    if (userText.includes("sleep") || userText.includes("insomnia") || userText.includes("tired")) {
      aiResponseText = "Sleep disruption is a primary indicator of burnout. I highly recommend establishing a screen-free window 1 hour before sleeping and aiming for a consistent 7+ hours of sleep. Would you like me to log this sleep alert in your analytics?";
    } else if (userText.includes("exam") || userText.includes("study") || userText.includes("stress") || userText.includes("overwhelmed")) {
      aiResponseText = "Academic pressure can quickly cause burnout. I suggest scheduling 10-minute micro-breaks for every 50 minutes of studying, and focusing on breaking your backlog down into small daily steps.";
    } else if (userText.includes("motivated") || userText.includes("procrastinate") || userText.includes("lazy")) {
      aiResponseText = "Motivation drops can be due to continuous stress. Try using the Pomodoro technique to complete just one simple, 15-minute task. It helps lower the entry barrier.";
    } else if (userText.includes("hello") || userText.includes("hi")) {
      aiResponseText = "Hello! I'm here to support your student wellness journey. Feel free to talk to me about your academic workload, sleep habits, or mood.";
    }

    conversation.messages.push({
      role: ConversationRole.Student,
      content: message.trim(),
      createdAt: new Date(),
    });

    conversation.messages.push({
      role: ConversationRole.Assistant,
      content: aiResponseText,
      createdAt: new Date(),
    });

    conversation.lastMessageAt = new Date();
    await conversation.save();

    res.status(200).json({
      success: true,
      data: {
        userMessage: {
          id: `m-usr-${Date.now()}`,
          sender: "user",
          text: message.trim(),
          timestamp: Date.now(),
        },
        aiMessage: {
          id: `m-ai-${Date.now() + 1}`,
          sender: "ai",
          text: aiResponseText,
          timestamp: Date.now() + 1,
        },
      },
    });
  } catch (error) {
    next(error);
  }
};

export const getAIHistory = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ success: false, message: "Unauthorized access" });
      return;
    }

    const userId = req.user.userId.toString();
    const conversation = await AIConversation.findOne({
      student: new Types.ObjectId(userId),
    });

    if (!conversation) {
      res.status(200).json({
        success: true,
        data: [
          {
            id: "m-0",
            sender: "ai",
            text: "Hi there! I'm your Wellness Assistant. I analyze your journal entries and weekly assessments to offer suggestions and monitor burnout. How are you feeling today?",
            timestamp: Date.now(),
          },
        ],
      });
      return;
    }

    const formattedMessages = conversation.messages.map((m, idx) => ({
      id: `m-${idx}-${m.createdAt.getTime()}`,
      sender: m.role === ConversationRole.Student ? "user" : "ai",
      text: m.content,
      timestamp: m.createdAt.getTime(),
    }));

    res.status(200).json({
      success: true,
      data: formattedMessages,
    });
  } catch (error) {
    next(error);
  }
};
