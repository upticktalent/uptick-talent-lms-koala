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

  // Methods
  acceptAndCreateStudent(
    reviewedBy: string,
  ): Promise<{ student: any; generatedPassword: string }>;
}

export interface IApplicationStatics {
  createForActiveCohort(applicationData: any): Promise<IApplication>;
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

// Validation to ensure track exists in the selected cohort
ApplicationSchema.pre("save", async function (next) {
  if (this.isNew || this.isModified("cohort") || this.isModified("track")) {
    const Cohort = mongoose.model("Cohort");
    const cohort = await Cohort.findById(this.cohort).populate("tracks.track");

    if (!cohort) {
      return next(new Error("Invalid cohort"));
    }

    const trackExists = cohort.tracks.some(
      (cohortTrack: any) =>
        cohortTrack.track._id?.toString() === (this.track as any).toString(),
    );

    if (!trackExists) {
      return next(new Error("Selected track is not available in this cohort"));
    }
  }
  next();
});

// Static method to create application for active cohort
ApplicationSchema.statics.createForActiveCohort = async function (
  applicationData: any,
) {
  const Cohort = mongoose.model("Cohort") as any;
  const activeCohort = await Cohort.getCurrentActive();

  if (!activeCohort) {
    throw new Error("No active cohort is currently accepting applications");
  }

  if (!activeCohort.isAcceptingApplications) {
    throw new Error("The current cohort is not accepting applications");
  }

  // Check deadline
  if (new Date() > activeCohort.applicationDeadline) {
    throw new Error("Application deadline has passed");
  }

  // Verify track exists in active cohort
  const trackExists = activeCohort.tracks.some(
    (cohortTrack: any) =>
      cohortTrack.track.trackId === applicationData.trackId ||
      cohortTrack.track._id.toString() === applicationData.trackId,
  );

  if (!trackExists) {
    throw new Error("Selected track is not available in the current cohort");
  }

  // Find the actual track ObjectId
  const cohortTrack = activeCohort.tracks.find(
    (ct: any) =>
      ct.track.trackId === applicationData.trackId ||
      ct.track._id.toString() === applicationData.trackId,
  );

  return new this({
    ...applicationData,
    cohort: activeCohort._id,
    track: cohortTrack.track._id,
  });
};

// Method to accept application and create student
ApplicationSchema.methods.acceptAndCreateStudent = async function (
  reviewedBy: string,
) {
  if (this.status === "accepted") {
    throw new Error("Application is already accepted");
  }

  // Generate random password for student
  const crypto = require("crypto");
  const generatedPassword = crypto.randomBytes(8).toString("hex");

  // Hash the password
  const bcrypt = require("bcrypt");
  const hashedPassword = await bcrypt.hash(generatedPassword, 10);

  // Create student user
  const User = mongoose.model("User") as any;
  const student = await User.createStudentFromApplication(
    {
      applicant: await User.findById(this.applicant),
      cohort: this.cohort,
      track: this.track,
      reviewedBy: reviewedBy,
    },
    hashedPassword,
  );

  // Update application status
  this.status = "accepted";
  this.reviewedBy = reviewedBy;
  this.reviewedAt = new Date();
  await this.save();

  return {
    student,
    generatedPassword, // Return unhashed password for email
  };
};

// Compound index to prevent duplicate applications
ApplicationSchema.index({ applicant: 1, cohort: 1 }, { unique: true });
ApplicationSchema.index({ status: 1 });
ApplicationSchema.index({ cohort: 1 });
ApplicationSchema.index({ track: 1 });
ApplicationSchema.index({ submittedAt: -1 });

export const Application = mongoose.model<
  IApplication,
  mongoose.Model<IApplication> & IApplicationStatics
>("Application", ApplicationSchema);
