import { z } from "zod";

// Application schema
export const applicationSchema = z.object({
  firstName: z
    .string()
    .trim()
    .min(1, "First name is required")
    .max(50, "First name cannot exceed 50 characters"),
  lastName: z
    .string()
    .trim()
    .min(1, "Last name is required")
    .max(50, "Last name cannot exceed 50 characters"),
  email: z.email("Please enter a valid email address"),
  phoneNumber: z.string().trim().min(1, "Phone number is required"),
  gender: z.enum(["male", "female"], {
    message: "Gender must be male or female",
  }),
  country: z.string().trim().min(1, "Country is required"),
  state: z.string().trim().min(1, "State is required"),

  educationalBackground: z.string().trim().optional(),
  tools: z.array(z.string().trim()).optional().default([]),
  trackId: z.string().trim().min(1, "Track is required"),
  cohortNumber: z.string().trim(),
  yearsOfExperience: z.enum(["less-than-1", "1-2", "2-3", "above-3"], {
    message: "Years of experience must be less-than-1, 1-2, 2-3, or above-3",
  }),
  githubLink: z
    .url("GitHub link must be a valid URL")
    .optional()
    .or(z.literal("")),
  portfolioLink: z
    .url("Portfolio link must be a valid URL")
    .optional()
    .or(z.literal("")),
  careerGoals: z
    .string()
    .trim()
    .min(1, "Career goals are required")
    .max(500, "Career goals cannot exceed 500 characters"),
  weeklyCommitment: z.enum(["yes", "no"], {
    message: "Weekly commitment must be yes or no",
  }),
  referralSource: z.enum(
    [
      "linkedin",
      "twitter",
      "instagram",
      "facebook",
      "friend-referral",
      "google-search",
      "job-board",
      "university",
      "other",
    ],
    {
      message: "Invalid referral source",
    },
  ),
  referralSourceOther: z
    .string()
    .trim()
    .max(200, "Other referral source cannot exceed 200 characters")
    .optional(),
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
    "shortlisted",
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
  email: z.email("Please enter a valid email address").toLowerCase().trim(),
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

// Assessment submission schema
export const assessmentSubmissionSchema = z.object({
  applicationId: z
    .string()
    .min(1, "Application ID is required")
    .regex(/^[0-9a-fA-F]{24}$/, "Invalid application ID format"),
  linkUrl: z.string().url("Please provide a valid URL").optional(),
  notes: z
    .string()
    .max(1000, "Notes cannot exceed 1000 characters")
    .trim()
    .optional(),
});

// Assessment review schema
export const assessmentReviewSchema = z.object({
  status: z.enum(["under-review", "rejected"]),
  reviewNotes: z
    .string()
    .max(1000, "Review notes cannot exceed 1000 characters")
    .trim()
    .optional(),
  score: z
    .number()
    .min(0, "Score cannot be negative")
    .max(100, "Score cannot exceed 100")
    .optional(),
});

export type AssessmentSubmissionInput = z.infer<
  typeof assessmentSubmissionSchema
>;
export type AssessmentReviewInput = z.infer<typeof assessmentReviewSchema>;

// Email Template schemas
export const emailTemplateSchema = z.object({
  name: z
    .string()
    .min(1, "Template name is required")
    .max(100, "Template name cannot exceed 100 characters")
    .trim(),
  subject: z
    .string()
    .min(1, "Subject is required")
    .max(200, "Subject cannot exceed 200 characters")
    .trim(),
  htmlContent: z.string().min(1, "HTML content is required"),
  textContent: z.string().trim().optional(),
  templateType: z.enum([
    "application_confirmation",
    "application_acceptance",
    "application_rejection",
    "assessment_invitation",
    "assessment_confirmation",
    "assessment_review",
    "welcome_email",
    "custom",
  ]),
  variables: z.array(z.string().trim().min(1)).optional().default([]),
  isActive: z.boolean().optional().default(true),
});

export const updateEmailTemplateSchema = emailTemplateSchema.partial().extend({
  isActive: z.boolean().optional(),
});

export const sendSingleEmailSchema = z.object({
  templateId: z.string().min(1, "Template ID is required"),
  recipientEmail: z.email("Please enter a valid email address"),
  recipientName: z.string().trim().optional(),
  recipientId: z.string().trim().optional(),
  recipientType: z.enum(["user", "applicant", "external"]).optional(),
  customVariables: z.record(z.string(), z.any()).optional(),
});

export type EmailTemplateInput = z.infer<typeof emailTemplateSchema>;
export type UpdateEmailTemplateInput = z.infer<
  typeof updateEmailTemplateSchema
>;
export type SendSingleEmailInput = z.infer<typeof sendSingleEmailSchema>;

export const directEmailSchema = z.object({
  recipient: z.object({
    email: z.email("Invalid email address"),
    name: z.string().min(1, "Recipient name is required"),
    id: z.string().optional(),
    type: z.enum(["user", "applicant", "external"]).optional(),
  }),
  subject: z
    .string()
    .min(1, "Subject is required")
    .max(200, "Subject too long"),
  content: z.string().min(1, "Content is required"),
  contentType: z.enum(["html", "markdown"]).default("html"),
  variables: z
    .record(z.string(), z.union([z.string(), z.number(), z.boolean()]))
    .optional(),
});

export const bulkEmailSchema = z.object({
  recipients: z
    .array(
      z.object({
        email: z.email(),
        name: z.string(),
        variables: z
          .record(z.string(), z.union([z.string(), z.number(), z.boolean()]))
          .optional(),
      }),
    )
    .min(1, "At least one recipient is required"),
  subject: z.string().min(1, "Subject is required"),
  content: z.string().min(1, "Content is required"),
  contentType: z.enum(["html", "markdown"]).default("html"),
  globalVariables: z
    .record(z.string(), z.union([z.string(), z.number(), z.boolean()]))
    .optional(),
});

export type directEmailInput = z.infer<typeof directEmailSchema>;
export type bulkEmailInput = z.infer<typeof bulkEmailSchema>;
