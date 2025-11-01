import { z } from "zod";

// Application schema
export const applicationSchema = z.object({
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
  gender: z.enum(["male", "female"]),
  country: z.string().min(1, "Country is required").trim(),
  state: z.string().min(1, "State is required").trim(),
  educationalQualification: z
    .string()
    .min(1, "Educational qualification is required")
    .max(200, "Educational qualification cannot exceed 200 characters")
    .trim()
    .optional(),
  trackId: z.enum([
    "frontend-development",
    "backend-development",
    "fullstack-development",
    "mobile-development",
    "product-management",
    "product-design",
    "data-science",
    "devops-engineering",
    "blockchain-development",
  ]),
  cohortNumber: z.string().min(1, "Cohort number is required").trim(),
});

// Login schema
export const loginSchema = z.object({
  email: z
    .email("Please enter a valid email address")
    .min(1, "Email is required")
    .toLowerCase()
    .trim(),
  password: z.string().min(1, "Password is required"),
});

// Password reset schema
export const passwordResetSchema = z.object({
  currentPassword: z.string().min(1, "Current password is required"),
  newPassword: z
    .string()
    .min(6, "New password must be at least 6 characters long"),
});

// Cohort schema
export const cohortSchema = z.object({
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
});

// Track schema
export const trackSchema = z.object({
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
});

// Application review schema
export const reviewApplicationSchema = z.object({
  status: z.enum([
    "pending",
    "under-review",
    "accepted",
    "rejected",
    "waitlisted",
  ]),
  reviewNotes: z
    .string()
    .max(1000, "Review notes cannot exceed 1000 characters")
    .trim()
    .optional(),
  rejectionReason: z
    .string()
    .max(500, "Rejection reason cannot exceed 500 characters")
    .trim()
    .optional(),
});

// Type exports
export type ApplicationInput = z.infer<typeof applicationSchema>;
export type LoginInput = z.infer<typeof loginSchema>;
export type PasswordResetInput = z.infer<typeof passwordResetSchema>;
export type CohortInput = z.infer<typeof cohortSchema>;
export type TrackInput = z.infer<typeof trackSchema>;
export type ReviewApplicationInput = z.infer<typeof reviewApplicationSchema>;

// User management schemas
export const createUserSchema = z.object({
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
    .string()
    .min(1, "Email is required")
    .email("Please enter a valid email address")
    .toLowerCase()
    .trim(),
  phoneNumber: z.string().min(1, "Phone number is required").trim(),
  gender: z.enum(["male", "female", "other", "prefer-not-to-say"]),
  country: z.string().min(1, "Country is required").trim(),
  state: z.string().min(1, "State is required").trim(),
  role: z.enum(["mentor", "admin"]),
  assignedTracks: z.array(z.string()).optional().default([]),
});

export const updateUserSchema = z.object({
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
  phoneNumber: z.string().min(1, "Phone number is required").trim().optional(),
  gender: z.enum(["male", "female", "other", "prefer-not-to-say"]).optional(),
  country: z.string().min(1, "Country is required").trim().optional(),
  state: z.string().min(1, "State is required").trim().optional(),
  assignedTracks: z.array(z.string()).optional(),
  isActive: z
    .boolean()
    .or(z.string().transform((val) => val === "true"))
    .optional(),
});

export type CreateUserInput = z.infer<typeof createUserSchema>;
export type UpdateUserInput = z.infer<typeof updateUserSchema>;
