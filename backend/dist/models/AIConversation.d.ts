import { type Document, type Model, type Types } from "mongoose";
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
export declare const AIConversation: Model<IAIConversation>;
