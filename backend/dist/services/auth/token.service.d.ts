import { Types } from "mongoose";
import type { AuthenticatedUser, AuthRole } from "../../types/auth.types.js";
export declare const generateToken: (userId: Types.ObjectId | string, email: string, role: AuthRole) => string;
export declare const generateRefreshToken: (userId: Types.ObjectId | string, email: string, role: AuthRole) => string;
export declare const verifyToken: (token: string) => AuthenticatedUser;
export declare const verifyRefreshToken: (token: string) => AuthenticatedUser;
