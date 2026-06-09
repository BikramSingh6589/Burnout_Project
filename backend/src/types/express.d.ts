import type { ObjectId } from "./common.types.js";

declare global {
  namespace Express {
    interface Request {
      user?: {
        studentId: ObjectId;
        email: string;
      };
    }
  }
}

export {};
