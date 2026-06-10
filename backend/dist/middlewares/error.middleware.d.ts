import type { NextFunction, Request, Response } from "express";
export declare class AppError extends Error {
    statusCode: number;
    isOperational: boolean;
    constructor(message: string, statusCode?: number, isOperational?: boolean);
}
export declare const errorMiddleware: (err: unknown, _req: Request, res: Response, _next: NextFunction) => Response;
