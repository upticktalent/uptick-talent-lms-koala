import { Request, Response, NextFunction } from "express";
import { z } from "zod";
import {
  applicationSchema,
  loginSchema,
  passwordResetSchema,
  reviewApplicationSchema,
  emailTemplateSchema,
  updateEmailTemplateSchema,
  sendSingleEmailSchema,
  directEmailSchema,
  bulkEmailSchema,
} from "../schemas/validation";

export interface ValidationError {
  field: string;
  message: string;
}

// Generic validation middleware factory
export const validate = (
  schema: z.ZodSchema<any>,
  checkFile: boolean = false,
) => {
  return (req: Request, res: Response, next: NextFunction) => {
    try {
      // Validate request body
      const validatedData = schema.parse(req.body);
      // Replace req.body with validated and transformed data
      req.body = validatedData;

      // Check for CV file if required
      if (checkFile && !req.file) {
        return res.status(400).json({
          success: false,
          message: "Validation failed",
          errors: [{ field: "cv", message: "CV file is required" }],
        });
      }

      next();
    } catch (error) {
      if (error instanceof z.ZodError) {
        const errors: ValidationError[] = error.issues.map((err) => ({
          field: err.path.join("."),
          message: err.message,
        }));
        console.log(errors);

        return res.status(400).json({
          success: false,
          message: "Validation failed",
          errors,
        });
      }

      // Handle unexpected errors
      return res.status(500).json({
        success: false,
        message: "Internal validation error",
      });
    }
  };
};

// Application validation (with CV file check)
export const validateApplication = validate(applicationSchema, true);

// Login validation
export const validateLogin = validate(loginSchema);

// Password reset validation
export const validatePasswordReset = validate(passwordResetSchema);

// Application review validation
export const validateReviewApplication = validate(reviewApplicationSchema);

// Cohort validation
export const validateCohort = validate(
  z.object({
    name: z
      .string()
      .min(1, "Cohort name is required")
      .max(100, "Cohort name cannot exceed 100 characters")
      .trim(),
    description: z
      .string()
      .max(1000, "Description cannot exceed 1000 characters")
      .trim()
      .optional(),
    startDate: z
      .string()
      .or(z.date())
      .transform((val) => new Date(val)),
    endDate: z
      .string()
      .or(z.date())
      .transform((val) => new Date(val)),
    maxStudents: z
      .number()
      .min(1, "Maximum students must be at least 1")
      .or(z.string().transform((val) => parseInt(val, 10))),
    tracks: z.array(z.string()).min(1, "At least one track is required"),
    isAcceptingApplications: z
      .boolean()
      .or(z.string().transform((val) => val === "true"))
      .optional()
      .default(true),
  }),
);

// Track validation
export const validateTrack = validate(
  z.object({
    name: z
      .string()
      .min(1, "Track name is required")
      .max(100, "Track name cannot exceed 100 characters")
      .trim(),
    description: z
      .string()
      .max(500, "Description cannot exceed 500 characters")
      .trim()
      .optional(),
    trackId: z.string().min(1, "Track ID is required").trim(),
  }),
);

// Query validation for pagination
export const validatePagination = (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const paginationSchema = z.object({
      page: z
        .string()
        .optional()
        .default("1")
        .transform((val) => parseInt(val, 10))
        .refine((val) => val > 0, "Page must be greater than 0"),
      limit: z
        .string()
        .optional()
        .default("10")
        .transform((val) => parseInt(val, 10))
        .refine(
          (val) => val > 0 && val <= 100,
          "Limit must be between 1 and 100",
        ),
      status: z
        .enum([
          "pending",
          "under-review",
          "accepted",
          "rejected",
          "shortlisted",
        ])
        .optional(),
      cohort: z.string().optional(),
      track: z.string().optional(),
    });

    const validatedQuery = paginationSchema.parse(req.query);
    req.query = validatedQuery as any;

    next();
  } catch (error) {
    if (error instanceof z.ZodError) {
      const errors: ValidationError[] = error.issues.map((err) => ({
        field: err.path.join("."),
        message: err.message,
      }));

      return res.status(400).json({
        success: false,
        message: "Invalid query parameters",
        errors,
      });
    }

    return res.status(500).json({
      success: false,
      message: "Internal validation error",
    });
  }
};

// User management validation
export const validateCreateUser = validate(
  z.object({
    firstName: z
      .string()
      .min(1, "First name is required")
      .max(50, "First name cannot exceed 50 characters")
      .trim(),
    lastName: z
      .string()
      .min(1, "Last name is required")
      .max(50, "Last name cannot exceed 50 characters")
      .trim(),
    email: z
      .email("Please enter a valid email address")
      .min(1, "Email is required")
      .toLowerCase()
      .trim(),
    phoneNumber: z.string().min(1, "Phone number is required").trim(),
    gender: z.enum(["male", "female", "other", "prefer-not-to-say"]),
    country: z.string().min(1, "Country is required").trim(),
    state: z.string().min(1, "State is required").trim(),
    role: z.enum(["mentor", "admin"]),
    assignedTracks: z.array(z.string()).optional().default([]),
  }),
);

export const validateUpdateUser = validate(
  z.object({
    firstName: z
      .string()
      .min(1, "First name is required")
      .max(50, "First name cannot exceed 50 characters")
      .trim()
      .optional(),
    lastName: z
      .string()
      .min(1, "Last name is required")
      .max(50, "Last name cannot exceed 50 characters")
      .trim()
      .optional(),
    phoneNumber: z
      .string()
      .min(1, "Phone number is required")
      .trim()
      .optional(),
    gender: z.enum(["male", "female", "other", "prefer-not-to-say"]).optional(),
    country: z.string().min(1, "Country is required").trim().optional(),
    state: z.string().min(1, "State is required").trim().optional(),
    assignedTracks: z.array(z.string()).optional(),
    isActive: z
      .boolean()
      .or(z.string().transform((val) => val === "true"))
      .optional(),
  }),
);

// Email template validation
export const validateEmailTemplate = validate(emailTemplateSchema);

export const validateUpdateEmailTemplate = validate(updateEmailTemplateSchema);

export const validateSendSingleEmail = validate(sendSingleEmailSchema);

// Validation  for direct email sending
export const validateDirectEmail = validate(directEmailSchema);
export const validateBulkEmail = validate(bulkEmailSchema);
