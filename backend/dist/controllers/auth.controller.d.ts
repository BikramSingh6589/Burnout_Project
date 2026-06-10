import type { NextFunction, Request, Response } from "express";
interface RegisterStudentBody {
    fullName: string;
    email: string;
    password: string;
    phoneNumber?: string;
    gender?: string;
    age?: number;
}
interface LoginStudentBody {
    email: string;
    password: string;
}
declare class HttpError extends Error {
    statusCode: number;
    constructor(statusCode: number, message: string);
}
export declare const registerStudent: (req: Request<Record<string, never>, unknown, RegisterStudentBody>, res: Response, next: NextFunction) => Promise<void>;
export declare const loginStudent: (req: Request<Record<string, never>, unknown, LoginStudentBody>, res: Response, next: NextFunction) => Promise<void>;
export declare const authenticateStudent: (req: Request, _res: Response, next: NextFunction) => Promise<void>;
export declare const getAuthenticatedStudent: (req: Request, res: Response, next: NextFunction) => Promise<void>;
export { HttpError };
