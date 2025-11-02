import mongoose from "mongoose";

export interface ErrorResponse {
  success: boolean;
  message: string;
  errors?: Array<{ field: string; message: string }>;
}

/**
 * Maps Mongoose/MongoDB errors to appropriate HTTP responses
 * @param error - The error object from Mongoose/MongoDB
 * @returns Object with status code and error response body
 */
export const mapMongooseError = (
  error: any,
): { status: number; body: ErrorResponse } => {
  // Mongoose ValidationError (schema validation failures)
  if (error instanceof mongoose.Error.ValidationError) {
    const errors = Object.values(error.errors).map((err: any) => ({
      field: err.path,
      message: err.message,
    }));

    return {
      status: 400,
      body: {
        success: false,
        message: "Validation failed",
        errors,
      },
    };
  }

  // Mongoose CastError (invalid ObjectId, type casting failures)
  if (error instanceof mongoose.Error.CastError) {
    return {
      status: 400,
      body: {
        success: false,
        message: `Invalid ${error.path}: ${error.value}`,
      },
    };
  }

  // MongoDB duplicate key error (unique constraint violations)
  if (error.code === 11000) {
    const field = Object.keys(error.keyValue || {})[0] || "field";
    const value = error.keyValue?.[field];

    return {
      status: 409,
      body: {
        success: false,
        message: `${field}${value ? ` '${value}'` : ""} already exists`,
      },
    };
  }

  // MongoDB duplicate index error
  if (error.code === 11001) {
    return {
      status: 409,
      body: {
        success: false,
        message: "Duplicate index error",
      },
    };
  }

  // Mongoose DocumentNotFoundError (when using .orFail())
  if (error instanceof mongoose.Error.DocumentNotFoundError) {
    return {
      status: 404,
      body: {
        success: false,
        message: "Document not found",
      },
    };
  }

  // Mongoose VersionError (optimistic concurrency control)
  if (error instanceof mongoose.Error.VersionError) {
    return {
      status: 409,
      body: {
        success: false,
        message: "Document was modified by another process. Please try again.",
      },
    };
  }

  // MongoDB server selection error
  if (error.name === "MongoServerSelectionError") {
    return {
      status: 503,
      body: {
        success: false,
        message: "Database server unavailable. Please try again later.",
      },
    };
  }

  // MongoDB network timeout error
  if (
    error.name === "MongoNetworkTimeoutError" ||
    error.message?.includes("timeout")
  ) {
    return {
      status: 408,
      body: {
        success: false,
        message: "Database operation timed out. Please try again.",
      },
    };
  }

  // MongoDB write concern error
  if (error.name === "WriteConcernError") {
    return {
      status: 500,
      body: {
        success: false,
        message: "Database write operation failed. Please try again.",
      },
    };
  }

  // MongoDB bulk write error
  if (error.name === "BulkWriteError") {
    return {
      status: 500,
      body: {
        success: false,
        message:
          "Bulk operation failed. Some records may not have been processed.",
      },
    };
  }

  // Connection-related errors
  if (error.message && error.message.toLowerCase().includes("connection")) {
    return {
      status: 503,
      body: {
        success: false,
        message: "Database connection error. Please try again later.",
      },
    };
  }

  // Generic Mongoose error
  if (error instanceof mongoose.Error) {
    return {
      status: 500,
      body: {
        success: false,
        message: "Database operation failed",
      },
    };
  }

  // Fallback for any other error
  return {
    status: 500,
    body: {
      success: false,
      message: "Internal server error",
    },
  };
};

/**
 * Async wrapper to handle errors in route handlers
 * @param fn - The async route handler function
 * @returns Express middleware function that catches errors and passes them to next()
 */
export const asyncHandler = <T extends (...args: any[]) => Promise<any>>(
  fn: T,
) => {
  return (req: any, res: any, next: any) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
};

/**
 * Validates if a string is a valid MongoDB ObjectId
 * @param id - The string to validate
 * @returns boolean indicating if the id is valid
 */
export const isValidObjectId = (id: string): boolean => {
  return mongoose.isValidObjectId(id);
};
