import mongoose, { Schema, Document } from "mongoose";

export interface IApplication extends Document {
  _id: string;
  applicant: mongoose.Types.ObjectId;
  cohort: mongoose.Types.ObjectId;
  track: mongoose.Types.ObjectId;
  cvUrl: string;
  tools: string[];
  status: "pending" | "under-review" | "accepted" | "rejected" | "shortlisted";
  reviewedBy?: mongoose.Types.ObjectId;
  reviewedAt?: Date;
  reviewNotes?: string;
  rejectionReason?: string;

  // New enhanced application fields
  educationalBackground: string;
  yearsOfExperience: string;
  githubLink?: string;
  portfolioLink?: string;
  careerGoals: string;
  weeklyCommitment: string;
  referralSource: string;
  referralSourceOther?: string;

  // Legacy fields for backward compatibility
  motivation?: string;
  educationalQualification?: string;

  submittedAt: Date;
  createdAt: Date;
  updatedAt: Date;
}

const ApplicationSchema: Schema = new Schema(
  {
    applicant: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: [true, "Applicant is required"],
    },
    cohort: {
      type: Schema.Types.ObjectId,
      ref: "Cohort",
      required: [true, "Cohort is required"],
    },
    track: {
      type: Schema.Types.ObjectId,
      ref: "Track",
      required: [true, "Track is required"],
    },
    cvUrl: {
      type: String,
      required: [true, "CV is required"],
      trim: true,
    },

    // New enhanced application fields
    educationalBackground: {
      type: String,
      trim: true,
      maxlength: [200, "Educational background cannot exceed 200 characters"],
    },
    tools: {
      type: [String],
      default: [],
    },
    status: {
      type: String,
      enum: {
        values: [
          "pending",
          "under-review",
          "accepted",
          "rejected",
          "shortlisted",
        ],
        message:
          "Status must be pending, under-review, accepted, rejected, or shortlisted",
      },
      default: "pending",
    },
    reviewedBy: {
      type: Schema.Types.ObjectId,
      ref: "User",
    },
    reviewedAt: {
      type: Date,
    },
    reviewNotes: {
      type: String,
      trim: true,
      maxlength: [1000, "Review notes cannot exceed 1000 characters"],
    },
    yearsOfExperience: {
      type: String,
      required: [true, "Years of experience is required"],
      trim: true,
      enum: {
        values: ["less-than-1", "1-2", "2-3", "above-3"],
        message:
          "Years of experience must be less-than-1, 1-2, 2-3, or above-3",
      },
    },
    githubLink: {
      type: String,
      trim: true,
      maxlength: [200, "GitHub link cannot exceed 200 characters"],
    },
    portfolioLink: {
      type: String,
      trim: true,
      maxlength: [200, "Portfolio link cannot exceed 200 characters"],
    },
    careerGoals: {
      type: String,
      required: [true, "Career goals are required"],
      trim: true,
      maxlength: [500, "Career goals cannot exceed 500 characters"],
    },
    weeklyCommitment: {
      type: String,
      required: [true, "Weekly commitment is required"],
      trim: true,
      enum: {
        values: ["yes", "no"],
        message: "Weekly commitment must be yes or no",
      },
    },
    referralSource: {
      type: String,
      required: [true, "Referral source is required"],
      trim: true,
      enum: {
        values: [
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
        message: "Invalid referral source",
      },
    },
    referralSourceOther: {
      type: String,
      trim: true,
      maxlength: [200, "Other referral source cannot exceed 200 characters"],
    },
    rejectionReason: {
      type: String,
      trim: true,
      maxlength: [500, "Rejection reason cannot exceed 500 characters"],
    },

    // Legacy fields for backward compatibility
    motivation: {
      type: String,
      trim: true,
      maxlength: [1000, "Motivation cannot exceed 1000 characters"],
    },
    submittedAt: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true,
  },
);

// Compound index to prevent duplicate applications
ApplicationSchema.index({ applicant: 1, cohort: 1 }, { unique: true });
ApplicationSchema.index({ status: 1 });
ApplicationSchema.index({ cohort: 1 });
ApplicationSchema.index({ track: 1 });
ApplicationSchema.index({ submittedAt: -1 });

export const Application = mongoose.model<IApplication>(
  "Application",
  ApplicationSchema,
);
