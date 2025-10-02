import { getters } from "@config";
import mongoose from "mongoose";

export const connectDatabase = async () => {
  try {
    const mongoUri = getters.getDatabaseUri();

    await mongoose.connect(mongoUri);

    mongoose.connection.on("error", (error) => {
      console.error("MongoDB connection error:", error);
    });

    mongoose.connection.on("disconnected", () => {
      console.warn("MongoDB disconnected");
    });
  } catch (error) {
    console.error("Failed to connect to MongoDB:", error);
    throw error;
  }
};

export const disconnectDatabase = async () => {
  await mongoose.connection.close();
};
