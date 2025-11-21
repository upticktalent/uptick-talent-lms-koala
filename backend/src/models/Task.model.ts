import mongoose, { Schema, Document } from "mongoose";

export interface ITask extends Document {
  _id: string;
  cohort: mongoose.Types.ObjectId;
  track: mongoose.Types.ObjectId;
  title: string;
  description: string;
  instructions?: string;
  dueDate?: Date;
  maxScore: number;
  attachments?: {
    name: string;
    url: string;
    type: string;
  }[];
  createdBy: mongoose.Types.ObjectId; // Mentor or Admin
  isPublished: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface ISubmission extends Document {
  _id: string;
  task: mongoose.Types.ObjectId;
  student: mongoose.Types.ObjectId;
  submissionText?: string;
  attachments?: {
    name: string;
    url: string;
    type: string;
  }[];
  submittedAt: Date;
  score?: number;
  feedback?: string;
  gradedBy?: mongoose.Types.ObjectId;
  gradedAt?: Date;
  status: "submitted" | "graded" | "returned";
  createdAt: Date;
  updatedAt: Date;
}

const TaskSchema: Schema = new Schema(
  {
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
    title: {
      type: String,
      required: [true, "Title is required"],
      trim: true,
      maxlength: [200, "Title cannot exceed 200 characters"],
    },
    description: {
      type: String,
      required: [true, "Description is required"],
      trim: true,
      maxlength: [2000, "Description cannot exceed 2000 characters"],
    },
    instructions: {
      type: String,
      trim: true,
      maxlength: [5000, "Instructions cannot exceed 5000 characters"],
    },
    dueDate: {
      type: Date,
    },
    maxScore: {
      type: Number,
      required: [true, "Max score is required"],
      min: [1, "Max score must be at least 1"],
      default: 100,
    },
    attachments: [
      {
        name: {
          type: String,
          required: true,
          trim: true,
        },
        url: {
          type: String,
          required: true,
          trim: true,
        },
        type: {
          type: String,
          required: true,
          trim: true,
        },
      },
    ],
    createdBy: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: [true, "Creator is required"],
    },
    isPublished: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  },
);

const SubmissionSchema: Schema = new Schema(
  {
    task: {
      type: Schema.Types.ObjectId,
      ref: "Task",
      required: [true, "Task is required"],
    },
    student: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: [true, "Student is required"],
    },
    submissionText: {
      type: String,
      trim: true,
      maxlength: [10000, "Submission text cannot exceed 10000 characters"],
    },
    attachments: [
      {
        name: {
          type: String,
          required: true,
          trim: true,
        },
        url: {
          type: String,
          required: true,
          trim: true,
        },
        type: {
          type: String,
          required: true,
          trim: true,
        },
      },
    ],
    submittedAt: {
      type: Date,
      default: Date.now,
    },
    score: {
      type: Number,
      min: [0, "Score cannot be negative"],
    },
    feedback: {
      type: String,
      trim: true,
      maxlength: [2000, "Feedback cannot exceed 2000 characters"],
    },
    gradedBy: {
      type: Schema.Types.ObjectId,
      ref: "User",
    },
    gradedAt: {
      type: Date,
    },
    status: {
      type: String,
      enum: {
        values: ["submitted", "graded", "returned"],
        message: "Status must be submitted, graded, or returned",
      },
      default: "submitted",
    },
  },
  {
    timestamps: true,
  },
);

// Ensure one submission per student per task
SubmissionSchema.index({ task: 1, student: 1 }, { unique: true });

// Index for performance
TaskSchema.index({ cohort: 1, track: 1, createdAt: -1 });
TaskSchema.index({ createdBy: 1 });
TaskSchema.index({ dueDate: 1 });
SubmissionSchema.index({ task: 1 });
SubmissionSchema.index({ student: 1 });
SubmissionSchema.index({ status: 1 });

export const Task = mongoose.model<ITask>("Task", TaskSchema);
export const Submission = mongoose.model<ISubmission>(
  "Submission",
  SubmissionSchema,
);
