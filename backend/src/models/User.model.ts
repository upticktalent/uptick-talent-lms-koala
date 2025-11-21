import mongoose, { Schema, Document } from "mongoose";

export interface ICohortAssignment {
  cohort: mongoose.Types.ObjectId;
  tracks: mongoose.Types.ObjectId[];
}

export interface IUser extends Document {
  _id: string;
  firstName: string;
  lastName: string;
  email: string;
  phoneNumber: string;
  gender: "male" | "female";
  country: string;
  state: string;
  password: string;
  role: "applicant" | "student" | "mentor" | "admin";

  // For students: cohort and track they belong to
  studentCohort?: mongoose.Types.ObjectId;
  studentTrack?: mongoose.Types.ObjectId;

  // For mentors: cohorts and tracks they are assigned to
  mentorAssignments?: ICohortAssignment[];

  // Legacy field for backward compatibility
  assignedTracks?: mongoose.Types.ObjectId[];

  isActive: boolean;
  isPasswordDefault: boolean;
  createdBy?: mongoose.Types.ObjectId; // Who created this user (for admins/mentors)
  lastLogin?: Date;
  createdAt: Date;
  updatedAt: Date;

  // Methods
  hasAccessToTrack(cohortId: string, trackId: string): boolean;
  getMentorCohorts(): mongoose.Types.ObjectId[];
  getTracksForCohort(cohortId: string): mongoose.Types.ObjectId[];
}

export interface IUserStatics {
  createStudentFromApplication(
    applicationData: any,
    generatedPassword: string,
  ): Promise<IUser>;
}

const UserSchema: Schema = new Schema(
  {
    firstName: {
      type: String,
      required: [true, "First name is required"],
      trim: true,
      maxlength: [50, "First name cannot exceed 50 characters"],
    },
    lastName: {
      type: String,
      required: [true, "Last name is required"],
      trim: true,
      maxlength: [50, "Last name cannot exceed 50 characters"],
    },
    email: {
      type: String,
      required: [true, "Email is required"],
      unique: true,
      lowercase: true,
      trim: true,
      match: [
        /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/,
        "Please enter a valid email address",
      ],
    },
    phoneNumber: {
      type: String,
      required: [true, "Phone number is required"],
      trim: true,
    },
    gender: {
      type: String,
      required: [true, "Gender is required"],
      enum: {
        values: ["male", "female"],
        message: "Gender must be male or female",
      },
    },
    country: {
      type: String,
      required: [true, "Country is required"],
      trim: true,
    },
    state: {
      type: String,
      required: [true, "State is required"],
      trim: true,
    },
    password: {
      type: String,
      required: [true, "Password is required"],
      minlength: [6, "Password must be at least 6 characters"],
    },
    role: {
      type: String,
      enum: {
        values: ["applicant", "student", "mentor", "admin"],
        message: "Role must be applicant, student, mentor, or admin",
      },
      default: "applicant",
    },
    // For students: cohort and track they belong to
    studentCohort: {
      type: Schema.Types.ObjectId,
      ref: "Cohort",
    },
    studentTrack: {
      type: Schema.Types.ObjectId,
      ref: "Track",
    },

    // For mentors: cohorts and tracks they are assigned to
    mentorAssignments: [
      {
        cohort: {
          type: Schema.Types.ObjectId,
          ref: "Cohort",
          required: true,
        },
        tracks: [
          {
            type: Schema.Types.ObjectId,
            ref: "Track",
          },
        ],
      },
    ],

    // Legacy field for backward compatibility
    assignedTracks: [
      {
        type: Schema.Types.ObjectId,
        ref: "Track",
      },
    ],
    isActive: {
      type: Boolean,
      default: true,
    },
    isPasswordDefault: {
      type: Boolean,
      default: false,
    },
    createdBy: {
      type: Schema.Types.ObjectId,
      ref: "User",
    },
    lastLogin: {
      type: Date,
    },
  },
  {
    timestamps: true,
    toJSON: {
      transform(doc, ret) {
        const { password, ...userWithoutPassword } = ret;
        return userWithoutPassword;
      },
    },
  },
);

// Method to check if user has access to a specific cohort and track
UserSchema.methods.hasAccessToTrack = function (
  cohortId: string,
  trackId: string,
) {
  if (this.role === "admin") return true;

  if (this.role === "student") {
    return (
      this.studentCohort?.toString() === cohortId &&
      this.studentTrack?.toString() === trackId
    );
  }

  if (this.role === "mentor") {
    return this.mentorAssignments?.some(
      (assignment: any) =>
        assignment.cohort.toString() === cohortId &&
        assignment.tracks.some((track: any) => track.toString() === trackId),
    );
  }

  return false;
};

// Method to get all cohorts a mentor is assigned to
UserSchema.methods.getMentorCohorts = function () {
  if (this.role !== "mentor") return [];
  return (
    this.mentorAssignments?.map((assignment: any) => assignment.cohort) || []
  );
};

// Method to get tracks for a specific cohort (for mentors)
UserSchema.methods.getTracksForCohort = function (cohortId: string) {
  if (this.role !== "mentor") return [];
  const assignment = this.mentorAssignments?.find(
    (assignment: any) => assignment.cohort.toString() === cohortId,
  );
  return assignment ? assignment.tracks : [];
};

// Static method to create a student from accepted application
UserSchema.statics.createStudentFromApplication = async function (
  applicationData: any,
  generatedPassword: string,
) {
  const student = new this({
    firstName: applicationData.applicant.firstName,
    lastName: applicationData.applicant.lastName,
    email: applicationData.applicant.email,
    phoneNumber: applicationData.applicant.phoneNumber,
    gender: applicationData.applicant.gender,
    country: applicationData.applicant.country,
    state: applicationData.applicant.state,
    password: generatedPassword,
    role: "student",
    studentCohort: applicationData.cohort,
    studentTrack: applicationData.track,
    isPasswordDefault: true,
    createdBy: applicationData.reviewedBy,
  });

  return student.save();
};

// Index for performance
UserSchema.index({ role: 1 });
UserSchema.index({ createdAt: -1 });
UserSchema.index({ studentCohort: 1, studentTrack: 1 });
UserSchema.index({ "mentorAssignments.cohort": 1 });

export const User = mongoose.model<IUser, mongoose.Model<IUser> & IUserStatics>(
  "User",
  UserSchema,
);
