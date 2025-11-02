import mongoose, { Schema, Document } from "mongoose";

export interface ICohort extends Document {
  _id: string;
  name: string;
  cohortNumber: string;
  description: string;
  startDate: Date;
  endDate: Date;
  maxStudents: number;
  currentStudents: number;
  tracks: mongoose.Types.ObjectId[];
  status: "upcoming" | "active" | "completed" | "cancelled";
  isAcceptingApplications: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const CohortSchema = new Schema(
  {
    name: {
      type: String,
      required: [true, "Cohort name is required"],
      unique: true,
      trim: true,
      maxlength: [100, "Cohort name cannot exceed 100 characters"],
    },
    cohortNumber: {
      type: String,
      required: [true, "Cohort number is required"],
      unique: true,
    },
    description: {
      type: String,
      trim: true,
      maxlength: [1000, "Description cannot exceed 1000 characters"],
    },
    startDate: {
      type: Date,
      required: [true, "Start date is required"],
    },
    endDate: {
      type: Date,
      required: [true, "End date is required"],
    },
    maxStudents: {
      type: Number,
      required: [true, "Maximum students is required"],
      min: [1, "Maximum students must be at least 1"],
    },
    currentStudents: {
      type: Number,
      default: 0,
      min: [0, "Current students cannot be negative"],
    },
    tracks: [
      {
        type: Schema.Types.ObjectId,
        ref: "Track",
        required: true,
      },
    ],
    status: {
      type: String,
      enum: {
        values: ["upcoming", "active", "completed", "cancelled"],
        message: "Status must be upcoming, active, completed, or cancelled",
      },
      default: "upcoming",
    },
    isAcceptingApplications: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  },
);

// Validation to ensure end date is after start date
CohortSchema.pre("save", function (next) {
  if (this.endDate <= this.startDate) {
    next(new Error("End date must be after start date"));
  }
  next();
});

// Index for performance
CohortSchema.index({ status: 1 });
CohortSchema.index({ startDate: 1 });
CohortSchema.index({ isAcceptingApplications: 1 });

export const Cohort = mongoose.model<ICohort>("Cohort", CohortSchema);
