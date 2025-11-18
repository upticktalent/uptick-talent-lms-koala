import express, { ErrorRequestHandler } from "express";
import cors, { CorsOptions } from "cors";
import { getters } from "./config";
import { loadServices } from "./loader";
import { mapMongooseError } from "./utils/mongooseErrorHandler";

// Add more route imports as needed

const app = express();

const corsOptions: CorsOptions = {
  origin: function (origin, callback) {
    const allowed = getters.getAllowedOrigins();
    if (!origin || allowed.includes(origin)) {
      console.log(origin);

      callback(null, origin);
    } else {
      callback(new Error("Not allowed by CORS"));
    }
  },
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
console.log(process.env.NODE_ENV);
// Global error handler - must be last
const errorHandler: ErrorRequestHandler = (err, _req, res, _next) => {
  console.error("🔥 Error:", err.stack || err.message || err);

  // Try to map Mongoose/MongoDB errors first
  const { status, body } = mapMongooseError(err);

  // In development, add stack trace for debugging
  const response =
    process.env.NODE_ENV === "production"
      ? body
      : { ...body, stack: err.stack };

  res.status(status).json(response);
};

app.use(errorHandler);

export default app;
