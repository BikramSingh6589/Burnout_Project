import { Schema, model, type Document, type Model, type Types } from "mongoose";
import { ConversationRole } from "../types/common.types.js";

export interface IAIMessage {
  role: ConversationRole;
  content: string;
  tokens?: number;
  createdAt: Date;
}

export interface IAIConversation extends Document {
  student: Types.ObjectId;
  sessionId: string;
  title?: string;
  messages: IAIMessage[];
  modelName?: string;
  riskFlags: string[];
  escalatedToCounselor: boolean;
  lastMessageAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

const AIMessageSchema = new Schema<IAIMessage>(
  {
    role: {
      type: String,
      enum: Object.values(ConversationRole),
      required: true,
    },
    content: {
      type: String,
      required: true,
      trim: true,
    },
    tokens: {
      type: Number,
      min: 0,
    },
    createdAt: {
      type: Date,
      default: Date.now,
      required: true,
    },
  },
  { _id: false },
);

const AIConversationSchema = new Schema<IAIConversation>(
  {
    student: {
      type: Schema.Types.ObjectId,
      ref: "Student",
      required: true,
      index: true,
    },
    sessionId: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },
    title: { type: String, trim: true, maxlength: 160 },
    messages: {
      type: [AIMessageSchema],
      default: [],
    },
    modelName: { type: String, trim: true },
    riskFlags: [{ type: String, trim: true, lowercase: true }],
    escalatedToCounselor: {
      type: Boolean,
      default: false,
      index: true,
    },
    lastMessageAt: Date,
  },
  { timestamps: true },
);

AIConversationSchema.index({ student: 1, lastMessageAt: -1 });
AIConversationSchema.index({ escalatedToCounselor: 1, updatedAt: -1 });

export const AIConversation: Model<IAIConversation> = model<IAIConversation>(
  "AIConversation",
  AIConversationSchema,
);
