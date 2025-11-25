import mongoose, { Schema, Document } from "mongoose";

export interface IAssessment extends Document {
  _id: string;
  application: mongoose.Types.ObjectId; // Required - links to Application
  cohort: mongoose.Types.ObjectId; // Required - links to Cohort
  fileUrl?: string;
  linkUrl?: string;
  notes?: string; // Optional notes from applicant
  status: "submitted" | "reviewed";
  reviewedBy?: mongoose.Types.ObjectId;
  reviewedAt?: Date;
  reviewNotes?: string;
  score?: number;
  submittedAt: Date;
  createdAt: Date;
  updatedAt: Date;
}

const AssessmentSchema: Schema = new Schema(
  {
    application: {
      type: Schema.Types.ObjectId,
      ref: "Application",
      required: [true, "Application ID is required"],
      unique: true, // One assessment per application
    },  
    cohort: {
      type: Schema.Types.ObjectId,
      ref: "Cohort",
      required: [true, "Cohort is required"],
    },
    fileUrl: {
      type: String,
      trim: true,
    },
    linkUrl: {
      type: String,
      trim: true,
      validate: {
        validator: function (value: string) {
          // If linkUrl is provided, it should be a valid URL
          if (value) {
            return /^https?:\/\/.+/.test(value);
          }
          return true;
        },
        message: "Please provide a valid URL",
      },
    },
    notes: {
      type: String,
      trim: true,
      maxlength: [1000, "Notes cannot exceed 1000 characters"],
    },
    status: {
      type: String,
      enum: {
        values: ["submitted", "reviewed"],
        message: "Status must be submitted or reviewed",
      },
      default: "submitted",
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
    score: {
      type: Number,
      min: [0, "Score cannot be negative"],
      max: [100, "Score cannot exceed 100"],
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

// Indexes for better query performance
AssessmentSchema.index({ status: 1 });
AssessmentSchema.index({ submittedAt: -1 });

export const Assessment = mongoose.model<IAssessment>(
  "Assessment",
  AssessmentSchema,
);
