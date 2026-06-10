import { Schema, model } from "mongoose";
import { AccountStatus, Gender, RiskLevel } from "../types/common.types.js";
const StudentProfileSchema = new Schema({
    department: { type: String, trim: true },
    program: { type: String, trim: true },
    yearOfStudy: { type: Number, min: 1, max: 10 },
    enrollmentNumber: { type: String, trim: true },
    guardianContact: { type: String, trim: true },
    emergencyContact: { type: String, trim: true },
}, { _id: false });
const StudentSchema = new Schema({
    fullName: {
        type: String,
        required: true,
        trim: true,
        minlength: 2,
        maxlength: 120,
    },
    email: {
        type: String,
        required: true,
        unique: true,
        lowercase: true,
        trim: true,
        match: [/^\S+@\S+\.\S+$/, "Invalid email address"],
    },
    phoneNumber: {
        type: String,
        trim: true,
    },
    gender: {
        type: String,
        enum: Object.values(Gender),
    },
    age: {
        type: Number,
        min: 13,
        max: 100,
    },
    password: {
        type: String,
        required: true,
        select: false,
        minlength: 8,
    },
    profile: StudentProfileSchema,
    accountStatus: {
        type: String,
        enum: Object.values(AccountStatus),
        default: AccountStatus.Active,
        index: true,
    },
    currentBurnoutScore: {
        type: Number,
        min: 0,
        max: 100,
        default: 0,
        index: true,
    },
    currentRiskLevel: {
        type: String,
        enum: Object.values(RiskLevel),
        default: RiskLevel.Low,
        index: true,
    },
    lastLoginAt: Date,
}, {
    timestamps: true,
});
StudentSchema.index({ email: 1 }, { unique: true });
StudentSchema.index({ "profile.enrollmentNumber": 1 }, { sparse: true });
StudentSchema.index({ accountStatus: 1, currentRiskLevel: 1 });
export const Student = model("Student", StudentSchema);
//# sourceMappingURL=Student.js.map