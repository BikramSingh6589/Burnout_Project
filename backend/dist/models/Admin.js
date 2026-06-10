import { Schema, model } from "mongoose";
import { AccountStatus, AdminRole } from "../types/common.types.js";
const AdminSchema = new Schema({
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
    password: {
        type: String,
        required: true,
        select: false,
        minlength: 8,
    },
    role: {
        type: String,
        enum: Object.values(AdminRole),
        default: AdminRole.Counselor,
        index: true,
    },
    accountStatus: {
        type: String,
        enum: Object.values(AccountStatus),
        default: AccountStatus.Active,
        index: true,
    },
    lastLoginAt: Date,
}, {
    timestamps: true,
});
AdminSchema.index({ role: 1, accountStatus: 1 });
export const Admin = model("Admin", AdminSchema);
//# sourceMappingURL=Admin.js.map