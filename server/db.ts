import mongoose from "mongoose";

export async function connectMongo(uri?: string) {
  const mongoUri = uri || process.env.MONGODB_URI;
  if (!mongoUri) {
    console.warn("MONGODB_URI is not set. Using mock/no-db mode.");
    return;
  }
  if (mongoose.connection.readyState === 1) return;
  try {
    await mongoose.connect(mongoUri, { dbName: process.env.MONGO_DB || undefined });
    console.log("MongoDB connected");
  } catch (e) {
    console.error("MongoDB connection error", e);
    throw e;
  }
}
