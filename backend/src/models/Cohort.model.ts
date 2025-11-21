import mongoose, { Schema, Document } from "mongoose";

export interface ICohortTrack {
  track: mongoose.Types.ObjectId;
  mentors: mongoose.Types.ObjectId[];
  maxStudents?: number;
  currentStudents: number;
}

export interface ICohort extends Document {
  _id: string;
  name: string;
  cohortNumber: string;
  description: string;
  startDate: Date;
  endDate: Date;
  applicationDeadline: Date;
  maxStudents: number;
  currentStudents: number;
  tracks: ICohortTrack[];
  status: "upcoming" | "active" | "completed" | "cancelled";
  isAcceptingApplications: boolean;
  isCurrentlyActive: boolean;
  hasTrack(trackId: string): Boolean;
  getMentorsForTrack(trackId: string): mongoose.Types.ObjectId[];
  addMentorToTrack(trackId: string, mentorId: string): Promise<ICohort>;
  createdAt: Date;
  updatedAt: Date;
}

export interface ICohortStatics {
  getCurrentActive(): Promise<ICohort | null>;
  setCurrentlyActive(cohortId: string): Promise<ICohort | null>;
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
    applicationDeadline: {
      type: Date,
      required: [true, "Application deadline is required"],
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
        track: {
          type: Schema.Types.ObjectId,
          ref: "Track",
          required: true,
        },
        mentors: [
          {
            type: Schema.Types.ObjectId,
            ref: "User",
          },
        ],
        maxStudents: {
          type: Number,
          min: [1, "Track max students must be at least 1"],
        },
        currentStudents: {
          type: Number,
          default: 0,
          min: [0, "Current students cannot be negative"],
        },
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
    isCurrentlyActive: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  },
);

// Validation to ensure dates are logical
CohortSchema.pre("save", function (next) {
  if (this.endDate <= this.startDate) {
    next(new Error("End date must be after start date"));
    return;
  }
  if (this.applicationDeadline >= this.startDate) {
    next(new Error("Application deadline must be before start date"));
    return;
  }
  next();
});

// Ensure only one cohort can be currently active for applications
CohortSchema.pre("save", async function (next) {
  if (this.isCurrentlyActive) {
    // Check if there's already a currently active cohort (excluding current document)
    const existingActiveCohort = await mongoose.model("Cohort").findOne({
      isCurrentlyActive: true,
      _id: { $ne: this._id },
    });

    if (existingActiveCohort) {
      next(new Error("Only one cohort can be currently active at a time"));
      return;
    }
  }
  next();
});

// Static method to get the current active cohort for applications
CohortSchema.statics.getCurrentActive = function () {
  return this.findOne({ isCurrentlyActive: true })
    .populate("tracks.track", "name trackId description")
    .populate("tracks.mentors", "firstName lastName email");
};

// Static method to set a cohort as currently active (deactivates others)
CohortSchema.statics.setCurrentlyActive = async function (cohortId: string) {
  // First, deactivate all other cohorts
  await this.updateMany(
    { isCurrentlyActive: true, _id: { $ne: cohortId } },
    { isCurrentlyActive: false },
  );

  // Then activate the specified cohort
  return this.findByIdAndUpdate(
    cohortId,
    { isCurrentlyActive: true },
    { new: true },
  )
    .populate("tracks.track", "name trackId description")
    .populate("tracks.mentors", "firstName lastName email");
};

// Method to check if a track exists in this cohort
CohortSchema.methods.hasTrack = function (trackId: string): Boolean {
  return this.tracks.some(
    (cohortTrack: any) =>
      cohortTrack.track._id.toString() === trackId ||
      cohortTrack.track.trackId === trackId,
  );
};

// Method to get mentors for a specific track in this cohort
CohortSchema.methods.getMentorsForTrack = function (trackId: string) {
  const cohortTrack = this.tracks.find(
    (ct: any) =>
      ct.track._id.toString() === trackId || ct.track.trackId === trackId,
  );
  return cohortTrack ? cohortTrack.mentors : [];
};

// Method to add a mentor to a track in this cohort
CohortSchema.methods.addMentorToTrack = function (
  trackId: string,
  mentorId: string,
) {
  const cohortTrack = this.tracks.find(
    (ct: any) =>
      ct.track._id.toString() === trackId || ct.track.trackId === trackId,
  );
  if (cohortTrack && !cohortTrack.mentors.includes(mentorId)) {
    cohortTrack.mentors.push(mentorId);
  }
  return this.save();
};

// Index for performance
CohortSchema.index({ status: 1 });
CohortSchema.index({ startDate: 1 });
CohortSchema.index({ isAcceptingApplications: 1 });

export const Cohort = mongoose.model<
  ICohort,
  mongoose.Model<ICohort> & ICohortStatics
>("Cohort", CohortSchema);
