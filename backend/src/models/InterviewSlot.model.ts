import mongoose, { Schema, Document } from "mongoose";

export interface IInterviewSlot extends Document {
  _id: string;
  interviewer: mongoose.Types.ObjectId; // Admin/Mentor who will conduct interview
  track?: mongoose.Types.ObjectId; // Single track this slot is for (optional for general slots)
  isGeneral: boolean; // If true, this slot is available for all tracks
  date: Date; // Date of availability
  startTime: string; // Format: "14:00" (2:00 PM)
  endTime: string; // Format: "15:00" (3:00 PM)
  duration: number; // Duration in minutes for each interview slot
  maxInterviews: number; // How many interviews can be scheduled in this time range
  isAvailable: boolean; // Whether this slot is still available
  bookedCount: number; // How many interviews are already booked
  location: string; // "Online" or physical location
  meetingLink?: string; // Default meeting link for this slot
  notes?: string; // Any special notes about this slot
  createdAt: Date;
  updatedAt: Date;
}

const InterviewSlotSchema: Schema = new Schema(
  {
    interviewer: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: [true, "Interviewer is required"],
    },
    cohort: {
      type: Schema.Types.ObjectId,
      ref: "Cohort",
      required: false,
    },
    track: {
      type: Schema.Types.ObjectId,
      ref: "Track",
      required: false,
    },
    isGeneral: {
      type: Boolean,
      default: false,
    },
    date: {
      type: Date,
      required: [true, "Date is required"],
    },
    startTime: {
      type: String,
      required: [true, "Start time is required"],
      validate: {
        validator: function (value: string) {
          return /^([0-1][0-9]|2[0-3]):[0-5][0-9]$/.test(value);
        },
        message: "Start time must be in HH:MM format (24-hour)",
      },
    },
    endTime: {
      type: String,
      required: [true, "End time is required"],
      validate: {
        validator: function (value: string) {
          return /^([0-1][0-9]|2[0-3]):[0-5][0-9]$/.test(value);
        },
        message: "End time must be in HH:MM format (24-hour)",
      },
    },
    duration: {
      type: Number,
      default: 30, // 30 minutes per interview
      min: [15, "Duration must be at least 15 minutes"],
      max: [120, "Duration cannot exceed 120 minutes"],
    },
    maxInterviews: {
      type: Number,
      default: 1, // How many interviews can fit in this time slot
      min: [1, "Must allow at least 1 interview"],
      max: [10, "Cannot exceed 10 interviews per slot"],
    },
    isAvailable: {
      type: Boolean,
      default: true,
    },
    bookedCount: {
      type: Number,
      default: 0,
      min: [0, "Booked count cannot be negative"],
    },
    location: {
      type: String,
      trim: true,
      default: "Online",
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
    notes: {
      type: String,
      trim: true,
      maxlength: [500, "Notes cannot exceed 500 characters"],
    },
  },
  {
    timestamps: true,
  },
);

// Add validation to ensure either track is provided OR isGeneral is true
InterviewSlotSchema.pre("validate", function (this: any) {
  if (!this.isGeneral && !this.track) {
    throw new Error(
      "Either track must be specified or slot must be marked as general",
    );
  }
  if (this.isGeneral && (this.track || this.cohort)) {
    throw new Error(
      "General slots cannot have specific track or cohort assignments",
    );
  }
});

// Compound index to prevent duplicate slots for same interviewer on same date/time
InterviewSlotSchema.index(
  { interviewer: 1, date: 1, startTime: 1 },
  { unique: true },
);

// Index for querying available slots
InterviewSlotSchema.index({ cohort: 1 });
InterviewSlotSchema.index({ date: 1, isAvailable: 1 });
InterviewSlotSchema.index({ interviewer: 1, date: 1 });

// Virtual to check if slot is fully booked
InterviewSlotSchema.virtual("isFullyBooked").get(function (
  this: IInterviewSlot,
) {
  return this.bookedCount >= this.maxInterviews;
});

// Update isAvailable based on booking status
InterviewSlotSchema.pre("save", function (this: IInterviewSlot, next) {
  this.isAvailable = this.bookedCount < this.maxInterviews;
  next();
});

// Validation to ensure either track is provided or isGeneral is true
InterviewSlotSchema.pre("validate", function (this: IInterviewSlot, next) {
  if (this.isGeneral && this.track) {
    return next(
      new Error("General slots cannot have a specific track assigned"),
    );
  }
  if (!this.isGeneral && !this.track) {
    return next(new Error("Non-general slots must have a track assigned"));
  }
  next();
});

export const InterviewSlot = mongoose.model<IInterviewSlot>(
  "InterviewSlot",
  InterviewSlotSchema,
);
