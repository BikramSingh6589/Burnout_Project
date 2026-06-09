import mongoose from "mongoose";
import dns from "node:dns";
const configureMongoDns = (mongoUri) => {
    if (!mongoUri.startsWith("mongodb+srv://")) {
        return;
    }
    const dnsServers = process.env.MONGODB_DNS_SERVERS?.trim() || "8.8.8.8,1.1.1.1";
    dns.setServers(dnsServers
        .split(",")
        .map((server) => server.trim())
        .filter(Boolean));
};
export const connectDatabase = async () => {
    const mongoUri = process.env.MONGODB_URI;
    if (!mongoUri) {
        throw new Error("MONGODB_URI is not configured");
    }
    mongoose.set("strictQuery", true);
    configureMongoDns(mongoUri);
    await mongoose.connect(mongoUri, {
        serverSelectionTimeoutMS: 10000,
    });
    console.log("MongoDB connected");
};
export const disconnectDatabase = async () => {
    await mongoose.disconnect();
};
//# sourceMappingURL=database.js.map