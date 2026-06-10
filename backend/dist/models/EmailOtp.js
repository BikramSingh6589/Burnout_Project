import { Schema, model } from "mongoose";
const EmailOtpSchema = new Schema({
    student: {
        type: Schema.Types.ObjectId,
        ref: "Student",
        required: true,
        index: true,
    },
    email: {
        type: String,
        required: true,
        lowercase: true,
        trim: true,
        index: true,
        match: [/^\S+@\S+\.\S+$/, "Invalid email address"],
    },
    otpHash: {
        type: String,
        required: true,
        select: false,
    },
    purpose: {
        type: String,
        enum: ["email_verification"],
        default: "email_verification",
        index: true,
    },
    expiresAt: {
        type: Date,
        required: true,
        index: true,
    },
    attempts: {
        type: Number,
        default: 0,
        min: 0,
    },
    lastSentAt: {
        type: Date,
        required: true,
    },
    verifiedAt: Date,
}, { timestamps: true });
EmailOtpSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });
EmailOtpSchema.index({ email: 1, purpose: 1, verifiedAt: 1, createdAt: -1 });
export const EmailOtp = model("EmailOtp", EmailOtpSchema);
//# sourceMappingURL=EmailOtp.js.map