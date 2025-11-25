import mongoose, { Schema, Document } from "mongoose";

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
  assignedTracks?: mongoose.Types.ObjectId[]; // For mentors - tracks they can review
  currentTrack?: mongoose.Types.ObjectId; // For students - current enrolled track
  currentCohort?: string; // For students - current enrolled cohort number
  isActive: boolean;
  isPasswordDefault: boolean;
  createdBy?: mongoose.Types.ObjectId; // Who created this user (for admins/mentors)
  lastLogin?: Date;
  createdAt: Date;
  updatedAt: Date;
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
    assignedTracks: [
      {
        type: Schema.Types.ObjectId,
        ref: "Track",
      },
    ],
    currentTrack: {
      type: Schema.Types.ObjectId,
      ref: "Track",
    },
    currentCohort: {
      type: String, // Cohort number
    },
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

// Index for performance
UserSchema.index({ role: 1 });
UserSchema.index({ createdAt: -1 });

export const User = mongoose.model<IUser>("User", UserSchema);
