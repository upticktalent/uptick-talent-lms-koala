import mongoose, { Schema, Document } from "mongoose";

export interface IMaterial extends Document {
  _id: string;
  cohort: mongoose.Types.ObjectId;
  track: mongoose.Types.ObjectId;
  title: string;
  description?: string;
  type: "document" | "video" | "link" | "slides" | "book" | "article";
  url: string;
  category: "lesson" | "resource" | "reference" | "supplementary";
  difficulty: "beginner" | "intermediate" | "advanced";
  estimatedReadTime?: number; // in minutes
  isRequired: boolean;
  isPublished: boolean;
  order: number; // for sequencing materials
  tags: string[];
  createdBy: mongoose.Types.ObjectId;
  accessCount: number;
  createdAt: Date;
  updatedAt: Date;
}

const MaterialSchema = new Schema(
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
      required: [true, "Material title is required"],
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
        values: ["document", "video", "link", "slides", "book", "article"],
        message: "Type must be document, video, link, slides, book, or article",
      },
      required: true,
    },
    url: {
      type: String,
      required: [true, "Material URL is required"],
    },
    category: {
      type: String,
      enum: {
        values: ["lesson", "resource", "reference", "supplementary"],
        message:
          "Category must be lesson, resource, reference, or supplementary",
      },
      default: "resource",
    },
    difficulty: {
      type: String,
      enum: {
        values: ["beginner", "intermediate", "advanced"],
        message: "Difficulty must be beginner, intermediate, or advanced",
      },
      default: "beginner",
    },
    estimatedReadTime: {
      type: Number,
      min: [1, "Estimated read time must be at least 1 minute"],
    },
    isRequired: {
      type: Boolean,
      default: false,
    },
    isPublished: {
      type: Boolean,
      default: true,
    },
    order: {
      type: Number,
      default: 0,
    },
    tags: [
      {
        type: String,
        trim: true,
        lowercase: true,
      },
    ],
    createdBy: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: [true, "Creator is required"],
    },
    accessCount: {
      type: Number,
      default: 0,
    },
  },
  {
    timestamps: true,
  },
);

// Compound index for cohort-track materials ordering
MaterialSchema.index({ cohort: 1, track: 1, order: 1 });
MaterialSchema.index({ createdBy: 1 });
MaterialSchema.index({ type: 1 });
MaterialSchema.index({ category: 1 });
MaterialSchema.index({ difficulty: 1 });
MaterialSchema.index({ isPublished: 1 });
MaterialSchema.index({ isRequired: 1 });
MaterialSchema.index({ tags: 1 });
MaterialSchema.index({ createdAt: -1 });

export const Material = mongoose.model<IMaterial>("Material", MaterialSchema);
