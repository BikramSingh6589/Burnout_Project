import mongoose from "mongoose";
import { config } from "./env.js";
export const connectDatabase = async () => {
    mongoose.set("strictQuery", true);
    await mongoose.connect(config.mongoUri, {
        serverSelectionTimeoutMS: 10000,
    });
    console.log("MongoDB connected");
};
export const disconnectDatabase = async () => {
    await mongoose.disconnect();
};
//# sourceMappingURL=database.js.map