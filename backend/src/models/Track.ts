import mongoose, { Schema, Document } from "mongoose";

export interface ITrack extends Document {
  _id: string;
  trackId: string;
  name: string;
  description: string;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const TrackSchema: Schema = new Schema(
  {
    name: {
      type: String,
      required: [true, "Track name is required"],
      unique: true,
      trim: true,
      maxlength: [100, "Track name cannot exceed 100 characters"],
    },
    trackId: {
      type: String,
      required: [true, "Track ID is required"],
      unique: true,
      enum: {
        values: [
          "frontend-development",
          "backend-development",
          "fullstack-development",
          "mobile-development",
          "product-management",
          "product-design",
          "data-science",
          "devops-engineering",
          "blockchain-development",
        ],
        message:
          "Track ID must be one of the predefined values: frontend-development, backend-development, fullstack-development, mobile-development, product-management, product-design, data-science, devops-engineering",
      },
    },
    description: {
      type: String,
      trim: true,
      maxlength: [500, "Description cannot exceed 500 characters"],
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  },
);

// Index for performance
TrackSchema.index({ isActive: 1 });

export const Track = mongoose.model<ITrack>("Track", TrackSchema);
