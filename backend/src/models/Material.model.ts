import mongoose, { Schema, Document } from "mongoose";

export interface IMaterial extends Document {
  _id: string;
  cohort: mongoose.Types.ObjectId;
  track: mongoose.Types.ObjectId;
  title: string;
  description?: string;
  type: "document" | "video" | "link" | "image" | "other";
  url: string;
  fileName?: string;
  fileSize?: number;
  createdBy: mongoose.Types.ObjectId; // Mentor or Admin
  isPublished: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const MaterialSchema: Schema = new Schema(
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
      trim: true,
      maxlength: [1000, "Description cannot exceed 1000 characters"],
    },
    type: {
      type: String,
      enum: {
        values: ["document", "video", "link", "image", "other"],
        message: "Type must be document, video, link, image, or other",
      },
      required: [true, "Type is required"],
    },
    url: {
      type: String,
      required: [true, "URL is required"],
      trim: true,
    },
    fileName: {
      type: String,
      trim: true,
    },
    fileSize: {
      type: Number,
      min: [0, "File size cannot be negative"],
    },
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

// Index for performance
MaterialSchema.index({ cohort: 1, track: 1, createdAt: -1 });
MaterialSchema.index({ createdBy: 1 });
MaterialSchema.index({ type: 1 });

export const Material = mongoose.model<IMaterial>("Material", MaterialSchema);
