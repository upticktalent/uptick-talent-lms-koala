import { connectDatabase } from "../models/db";

const testConnection = async () => {
  try {
    console.log("Testing database connection...");
    await connectDatabase();
    console.log("✅ Database connection successful!");
    process.exit(0);
  } catch (error) {
    console.error("❌ Database connection failed:", error);
    process.exit(1);
  }
};

testConnection();
