import mongoose, { Schema, Document } from "mongoose";

export interface IStream extends Document {
  _id: string;
  cohort: mongoose.Types.ObjectId;
  track?: mongoose.Types.ObjectId; // null means announcement for all tracks
  title: string;
  content: string;
  author: mongoose.Types.ObjectId; // Admin or Mentor who created this
  attachments?: {
    name: string;
    url: string;
    type: string;
  }[];
  isImportant: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const StreamSchema: Schema = new Schema(
  {
    cohort: {
      type: Schema.Types.ObjectId,
      ref: "Cohort",
      required: [true, "Cohort is required"],
    },
    track: {
      type: Schema.Types.ObjectId,
      ref: "Track",
      // null means announcement for all tracks in the cohort
    },
    title: {
      type: String,
      required: [true, "Title is required"],
      trim: true,
      maxlength: [200, "Title cannot exceed 200 characters"],
    },
    content: {
      type: String,
      required: [true, "Content is required"],
      trim: true,
      maxlength: [5000, "Content cannot exceed 5000 characters"],
    },
    author: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: [true, "Author is required"],
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
    isImportant: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  },
);

// Index for performance
StreamSchema.index({ cohort: 1, track: 1, createdAt: -1 });
StreamSchema.index({ author: 1 });

export const Stream = mongoose.model<IStream>("Stream", StreamSchema);
