import mongoose, { Schema, Document } from "mongoose";

export interface IInterview extends Document {
  _id: string;
  application: mongoose.Types.ObjectId; // Links to Application
  interviewer: mongoose.Types.ObjectId; // Admin/Mentor conducting interview
  scheduledDate: Date; // When the interview is scheduled
  duration: number; // Duration in minutes (default 30)
  meetingLink?: string; // Zoom/Meet link
  location?: string; // Physical location or "Online"
  status: "scheduled" | "interviewed" | "cancelled" | "no-show";
  notes?: string; // Interview notes from interviewer
  rating?: number; // 1-10 rating
  feedback?: string; // Detailed feedback
  scheduledBy: mongoose.Types.ObjectId; // Who scheduled it (applicant)
  createdBy: mongoose.Types.ObjectId; // Who created the slot (admin/mentor)
  createdAt: Date;
  updatedAt: Date;
}

const InterviewSchema: Schema = new Schema(
  {
    application: {
      type: Schema.Types.ObjectId,
      ref: "Application",
      required: [true, "Application ID is required"],
      unique: true, // One interview per application
    },
 cohort: {
          type: Schema.Types.ObjectId,
          ref: "Cohort",
          required: [true, "Cohort is required"],
        },
    interviewer: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: [true, "Interviewer is required"],
    },
    scheduledDate: {
      type: Date,
      required: [true, "Scheduled date is required"],
    },
    duration: {
      type: Number,
      default: 30, // 30 minutes default
      min: [15, "Duration must be at least 15 minutes"],
      max: [120, "Duration cannot exceed 120 minutes"],
    },
    meetingLink: {
      type: String,
      trim: true,
      validate: {
        validator: function (value: string) {
          if (value) {
            return /^https?:\/\/.+/.test(value);
          }
          return true;
        },
        message: "Please provide a valid meeting link URL",
      },
    },
    location: {
      type: String,
      trim: true,
      default: "Online",
    },
    status: {
      type: String,
      enum: {
        values: ["scheduled", "interviewed", "cancelled", "no-show"],
        message: "Status must be scheduled, interviewed, cancelled, or no-show",
      },
      default: "scheduled",
    },
    notes: {
      type: String,
      trim: true,
      maxlength: [2000, "Notes cannot exceed 2000 characters"],
    },
    rating: {
      type: Number,
      min: [1, "Rating must be between 1 and 10"],
      max: [10, "Rating must be between 1 and 10"],
    },
    feedback: {
      type: String,
      trim: true,
      maxlength: [2000, "Feedback cannot exceed 2000 characters"],
    },
    scheduledBy: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: [true, "Scheduled by user is required"],
    },
    createdBy: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: [true, "Created by user is required"],
    },
  },
  {
    timestamps: true,
  },
);

// Indexes for better query performance
InterviewSchema.index({ status: 1 });
InterviewSchema.index({ scheduledDate: 1 });
InterviewSchema.index({ interviewer: 1, scheduledDate: 1 });

export const Interview = mongoose.model<IInterview>(
  "Interview",
  InterviewSchema,
);
