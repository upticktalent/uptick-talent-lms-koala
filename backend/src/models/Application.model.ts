import mongoose, { Schema, Document } from "mongoose";

export interface IApplication extends Document {
  _id: string;
  applicant: mongoose.Types.ObjectId;
  cohort: mongoose.Types.ObjectId;
  track: mongoose.Types.ObjectId;
  educationalQualification: string;
  cvUrl: string;
  tools: string[];
  status: "pending" | "under-review" | "accepted" | "rejected" | "shortlisted";
  reviewedBy?: mongoose.Types.ObjectId;
  reviewedAt?: Date;
  reviewNotes?: string;
  rejectionReason?: string;
  motivation?: string;
  referralSource?: string;
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
    educationalQualification: {
      type: String,
      trim: true,
      maxlength: [
        200,
        "Educational qualification cannot exceed 200 characters",
      ],
    },
    cvUrl: {
      type: String,
      required: [true, "CV is required"],
      trim: true,
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
    motivation: {
      type: String,
      trim: true,
      maxlength: [1000, "Motivation cannot exceed 1000 characters"],
    },
    referralSource: {
      type: String,
      trim: true,
      maxlength: [500, "Referral source cannot exceed 500 characters"],
    },
    rejectionReason: {
      type: String,
      trim: true,
      maxlength: [500, "Rejection reason cannot exceed 500 characters"],
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
