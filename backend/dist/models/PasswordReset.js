import { Schema, model } from "mongoose";
const PasswordResetSchema = new Schema({
    student: {
        type: Schema.Types.ObjectId,
        ref: "Student",
        index: true,
    },
    admin: {
        type: Schema.Types.ObjectId,
        ref: "Admin",
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
    tokenHash: {
        type: String,
        required: true,
        unique: true,
        select: false,
    },
    expiresAt: {
        type: Date,
        required: true,
        index: true,
    },
    usedAt: Date,
    requestedIp: { type: String, trim: true },
    userAgent: { type: String, trim: true },
}, { timestamps: true });
PasswordResetSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });
PasswordResetSchema.index({ email: 1, usedAt: 1, createdAt: -1 });
export const PasswordReset = model("PasswordReset", PasswordResetSchema);
//# sourceMappingURL=PasswordReset.js.map