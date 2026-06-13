import type { NextFunction, Request, Response } from "express";
import { Student } from "../models/Student.js";
import { AIConversation } from "../models/AIConversation.js";
import { ConversationRole } from "../types/common.types.js";
import { Types } from "mongoose";
import { generateAIResponse, streamAIResponse } from "../services/ai/assistant.service.js";

const getFallbackAssistantResponse = (message: string): string => {
  const userText = message.toLowerCase();

  if (userText.includes("sleep") || userText.includes("insomnia") || userText.includes("tired")) {
    return "Sleep disruption is a strong burnout signal. Try a consistent bedtime routine, reduce screen exposure before bed, and aim for 7+ hours of rest per night.";
  }

  if (userText.includes("exam") || userText.includes("study") || userText.includes("stress") || userText.includes("overwhelmed")) {
    return "Academic stress is common, and small, structured breaks can help. Try studying in focused intervals with built-in rest, and break your tasks into bite-sized steps.";
  }

  if (userText.includes("motivated") || userText.includes("procrastinate") || userText.includes("lazy")) {
    return "Motivation dips are often linked to burnout and overwhelm. Start with one small, achievable task to build momentum and keep your goals simple.";
  }

  if (userText.includes("hello") || userText.includes("hi")) {
    return "Hello! I'm here to support your wellness journey. Ask me about stress, sleep, study habits, or general questions anytime.";
  }

  return "I’m here to help. Tell me more about what you’re feeling or ask any question about your studies, wellness, or productivity.";
};

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

    let aiResponseText: string;
    try {
      aiResponseText = await generateAIResponse(userId, student, conversation.messages, message);
    } catch (error) {
      console.error("[AI] Groq assistant error:", error);
      aiResponseText = getFallbackAssistantResponse(message);
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
    conversation.modelName = process.env.GROQ_MODEL ?? conversation.modelName;
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

export const chatWithAIStream = async (
  req: Request,
  res: Response,
  next: NextFunction,
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

    res.setHeader("Content-Type", "text/event-stream;charset=utf-8");
    res.setHeader("Cache-Control", "no-cache, no-transform");
    res.setHeader("Connection", "keep-alive");
    res.setHeader("X-Accel-Buffering", "no");
    res.flushHeaders?.();

    const sendEvent = (event: string, data: any) => {
      if (res.writableEnded) return;
      res.write(`event: ${event}\n`);
      res.write(`data: ${JSON.stringify(data)}\n\n`);
    };

    const sendDelta = (chunk: string) => sendEvent("message", chunk);

    let finalAssistantText = "";
    try {
      finalAssistantText = await streamAIResponse(
        userId,
        student,
        conversation.messages,
        message,
        (delta) => {
          sendDelta(delta);
        },
      );
    } catch (error) {
      console.error("[AI] Groq assistant streaming error:", error);
      const fallbackText = getFallbackAssistantResponse(message);
      sendDelta(fallbackText);
      finalAssistantText = fallbackText;
    }

    conversation.messages.push({
      role: ConversationRole.Student,
      content: message.trim(),
      createdAt: new Date(),
    });

    conversation.messages.push({
      role: ConversationRole.Assistant,
      content: finalAssistantText,
      createdAt: new Date(),
    });
    conversation.lastMessageAt = new Date();
    conversation.modelName = process.env.GROQ_MODEL ?? conversation.modelName;
    await conversation.save();

    sendEvent("done", { success: true });
    res.end();
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
