import express, { ErrorRequestHandler } from "express";

import cors from "cors";
import { getters } from "@config";
import { loadServices } from "./loader";

// Add more route imports as needed

const app = express();

const corsOptions = {
  origin:
    process.env.NODE_ENV === "production" ? getters.getAllowedOrigins() : "*",
  methods: ["GET", "POST", "PUT", "DELETE", "PATCH"],
  credentials: true,
};

app.use(cors(corsOptions));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Register routes via loader
loadServices(app);

// 404 handler - must be after all routes
app.use((_req, res) => {
  res.status(404).json({
    success: false,
    message: "Route not found",
  });
});

// Global error handler - must be last
const errorHandler: ErrorRequestHandler = (err, _req, res, _next) => {
  console.error("🔥 Error:", err.stack || err.message || err);

  const message =
    process.env.NODE_ENV === "production"
      ? "Internal Server Error"
      : err.message;

  res.status(err.status || 500).json({
    success: false,
    message,
    ...(process.env.NODE_ENV !== "production" && { stack: err.stack }),
  });
};

app.use(errorHandler);

export default app;
