import jwt from "jsonwebtoken";
import { Types } from "mongoose";
import { config } from "../../config/env.js";
const TOKEN_EXPIRY = "2d";
const REFRESH_TOKEN_EXPIRY = "7d";
export const generateToken = (userId, email, role) => {
    const payload = {
        userId: userId.toString(),
        email,
        role,
    };
    return jwt.sign(payload, config.jwtSecret, { expiresIn: TOKEN_EXPIRY });
};
export const generateRefreshToken = (userId, email, role) => {
    const payload = {
        userId: userId.toString(),
        email,
        role,
    };
    return jwt.sign(payload, config.jwtRefreshSecret, { expiresIn: REFRESH_TOKEN_EXPIRY });
};
export const verifyToken = (token) => {
    const decoded = jwt.verify(token, config.jwtSecret);
    if (!decoded.userId || !decoded.email || decoded.role !== "student" || !Types.ObjectId.isValid(decoded.userId)) {
        throw new Error("Unauthorized access");
    }
    return {
        userId: new Types.ObjectId(decoded.userId),
        email: decoded.email,
        role: decoded.role,
    };
};
export const verifyRefreshToken = (token) => {
    const decoded = jwt.verify(token, config.jwtRefreshSecret);
    if (!decoded.userId || !decoded.email || decoded.role !== "student" || !Types.ObjectId.isValid(decoded.userId)) {
        throw new Error("Unauthorized access");
    }
    return {
        userId: new Types.ObjectId(decoded.userId),
        email: decoded.email,
        role: decoded.role,
    };
};
//# sourceMappingURL=token.service.js.map