import app from "./app";
import { connectDatabase } from "./models/db";
import { getters } from "@config";

const port = getters.getAppPort();

const startServer = async () => {
  try {
    // Connect to database first
    await connectDatabase();
    console.log("✅ Database connected");

    app.listen(port, () => {
      console.log(`${getters.geti18ns().LOGS.RUNNING_APP} ${port}`);
      console.log(`🚀 Server: http://localhost:${port}`);
    });
  } catch (error) {
    console.error("❌ Failed to start server:", error);
    process.exit(1);
  }
};

// Handle unhandled rejections
process.on("unhandledRejection", (reason, promise) => {
  console.error("Unhandled Rejection at:", promise, "reason:", reason);
  process.exit(1);
});

// Handle uncaught exceptions
process.on("uncaughtException", (error) => {
  console.error("Uncaught Exception:", error);
  process.exit(1);
});

startServer();
