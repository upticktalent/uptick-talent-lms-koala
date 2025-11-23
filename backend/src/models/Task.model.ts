import mongoose, { Schema, Document } from "mongoose";

export interface ITaskResource {
  title: string;
  description?: string;
  type: "link" | "file" | "video" | "reading"|"document";
  url: string;
  isRequired: boolean;
}

export interface ITaskSubmissionAttachment {
  filename: string;
  originalName: string;
  url: string;
  size: number;
  type: string;
  uploadedAt: Date;
}

export interface ITaskSubmission {
  task: mongoose.Types.ObjectId;
  student: mongoose.Types.ObjectId;
  content?: string;
  attachments: ITaskSubmissionAttachment[];
  status: "draft" | "submitted" | "graded" | "returned";
  score?: number;
  maxScore: number;
  feedback?: string;
  gradedBy?: mongoose.Types.ObjectId;
  submittedAt?: Date;
  gradedAt?: Date;
  isLate: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface ITask extends Document {
  _id: string;
  cohort: mongoose.Types.ObjectId;
  track: mongoose.Types.ObjectId;
  title: string;
  description: string;
  type: "assignment" | "project" | "quiz" | "reading";
  difficulty: "beginner" | "intermediate" | "advanced";
  estimatedHours: number;
  maxScore: number;
  dueDate: Date;
  createdBy: mongoose.Types.ObjectId;
  requirements: string[];
  resources: ITaskResource[];
  submissions: ITaskSubmission[];
  isPublished: boolean;
  allowLateSubmissions: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const TaskResourceSchema = new Schema({
  title: {
    type: String,
    required: [true, "Resource title is required"],
    trim: true,
  },
  description: {
    type: String,
    trim: true,
  },
  type: {
    type: String,
    enum: ["link", "file", "video", "reading","document"],
    required: true,
  },
  url: {
    type: String,
    required: [true, "Resource URL is required"],
  },
  isRequired: {
    type: Boolean,
    default: false,
  },
});

const TaskSubmissionAttachmentSchema = new Schema({
  filename: {
    type: String,
    required: true,
  },
  originalName: {
    type: String,
    required: true,
  },
  url: {
    type: String,
    required: true,
  },
  size: {
    type: Number,
    required: true,
  },
  type: {
    type: String,
    required: true,
  },
  uploadedAt: {
    type: Date,
    default: Date.now,
  },
});

const TaskSubmissionSchema = new Schema(
  {
    task: {
      type: Schema.Types.ObjectId,
      ref: "Task",
      required: true,
    },
    student: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    content: {
      type: String,
      trim: true,
    },
    attachments: [TaskSubmissionAttachmentSchema],
    status: {
      type: String,
      enum: ["draft", "submitted", "graded", "returned"],
      default: "draft",
    },
    score: {
      type: Number,
      min: 0,
    },
    maxScore: {
      type: Number,
      required: true,
    },
    feedback: {
      type: String,
      trim: true,
    },
    gradedBy: {
      type: Schema.Types.ObjectId,
      ref: "User",
    },
    submittedAt: {
      type: Date,
    },
    gradedAt: {
      type: Date,
    },
    isLate: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  },
);

const TaskSchema = new Schema(
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
      required: [true, "Task title is required"],
      trim: true,
      maxlength: [200, "Title cannot exceed 200 characters"],
    },
    description: {
      type: String,
      required: [true, "Task description is required"],
      trim: true,
    },
    type: {
      type: String,
      enum: {
        values: ["assignment", "project", "quiz", "reading"],
        message: "Type must be assignment, project, quiz, or reading",
      },
      required: true,
    },
    difficulty: {
      type: String,
      enum: {
        values: ["beginner", "intermediate", "advanced"],
        message: "Difficulty must be beginner, intermediate, or advanced",
      },
      required: true,
    },
    estimatedHours: {
      type: Number,
      required: [true, "Estimated hours is required"],
      min: [0.5, "Estimated hours must be at least 0.5"],
    },
    maxScore: {
      type: Number,
      required: [true, "Maximum score is required"],
      min: [1, "Maximum score must be at least 1"],
    },
    dueDate: {
      type: Date,
      required: [true, "Due date is required"],
    },
    createdBy: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: [true, "Creator is required"],
    },
    requirements: [
      {
        type: String,
        trim: true,
      },
    ],
    resources: [TaskResourceSchema],
    submissions: [TaskSubmissionSchema],
    isPublished: {
      type: Boolean,
      default: true,
    },
    allowLateSubmissions: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  },
);

// Validation: Due date must be in the future
TaskSchema.pre("save", function (next) {
  if (this.dueDate <= new Date()) {
    next(new Error("Due date must be in the future"));
    return;
  }
  next();
});

// Indexes for performance
TaskSchema.index({ cohort: 1, track: 1 });
TaskSchema.index({ createdBy: 1 });
TaskSchema.index({ type: 1 });
TaskSchema.index({ difficulty: 1 });
TaskSchema.index({ isPublished: 1 });
TaskSchema.index({ dueDate: 1 });
TaskSchema.index({ createdAt: -1 });

export const Task = mongoose.model<ITask>("Task", TaskSchema);
