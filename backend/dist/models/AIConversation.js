import { Schema, model } from "mongoose";
import { ConversationRole } from "../types/common.types.js";
const AIMessageSchema = new Schema({
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
}, { _id: false });
const AIConversationSchema = new Schema({
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
}, { timestamps: true });
AIConversationSchema.index({ student: 1, lastMessageAt: -1 });
AIConversationSchema.index({ escalatedToCounselor: 1, updatedAt: -1 });
export const AIConversation = model("AIConversation", AIConversationSchema);
//# sourceMappingURL=AIConversation.js.map