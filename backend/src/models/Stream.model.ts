import mongoose, { Schema, Document } from "mongoose";

export interface IStreamAttachment {
  title: string;
  url: string;
  type: "link" | "file" | "video" | "image";
  size?: number;
  uploadedAt: Date;
}

export interface IStreamReaction {
  user: mongoose.Types.ObjectId;
  type: "like" | "love" | "helpful" | "confused";
  createdAt: Date;
}

export interface IStreamCommentReply {
  user: mongoose.Types.ObjectId;
  content: string;
  createdAt: Date;
}

export interface IStreamComment {
  user: mongoose.Types.ObjectId;
  content: string;
  replies: IStreamCommentReply[];
  createdAt: Date;
  updatedAt: Date;
}

export interface IStream extends Document {
  _id: string;
  cohort: mongoose.Types.ObjectId;
  track: mongoose.Types.ObjectId;
  title: string;
  content: string;
  type: "announcement" | "lesson" | "update";
  createdBy: mongoose.Types.ObjectId;
  isPublished: boolean;
  scheduledFor?: Date;
  attachments: IStreamAttachment[];
  reactions: IStreamReaction[];
  comments: IStreamComment[];
  createdAt: Date;
  updatedAt: Date;
}

const StreamAttachmentSchema = new Schema({
  title: {
    type: String,
    required: [true, "Attachment title is required"],
    trim: true,
  },
  url: {
    type: String,
    required: [true, "Attachment URL is required"],
  },
  type: {
    type: String,
    enum: ["link", "file", "video", "image"],
    required: true,
  },
  size: {
    type: Number,
  },
  uploadedAt: {
    type: Date,
    default: Date.now,
  },
});

const StreamReactionSchema = new Schema({
  user: {
    type: Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  type: {
    type: String,
    enum: ["like", "love", "helpful", "confused"],
    required: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

const StreamCommentReplySchema = new Schema({
  user: {
    type: Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  content: {
    type: String,
    required: [true, "Reply content is required"],
    trim: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

const StreamCommentSchema = new Schema(
  {
    user: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    content: {
      type: String,
      required: [true, "Comment content is required"],
      trim: true,
    },
    replies: [StreamCommentReplySchema],
  },
  {
    timestamps: true,
  },
);

const StreamSchema = new Schema(
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
      required: [true, "Stream title is required"],
      trim: true,
      maxlength: [200, "Title cannot exceed 200 characters"],
    },
    content: {
      type: String,
      required: [true, "Stream content is required"],
      trim: true,
    },
    type: {
      type: String,
      enum: {
        values: ["announcement", "lesson", "update"],
        message: "Type must be announcement, lesson, or update",
      },
      required: true,
    },
    createdBy: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: [true, "Creator is required"],
    },
    isPublished: {
      type: Boolean,
      default: true,
    },
    scheduledFor: {
      type: Date,
    },
    attachments: [StreamAttachmentSchema],
    reactions: [StreamReactionSchema],
    comments: [StreamCommentSchema],
  },
  {
    timestamps: true,
  },
);

// Indexes for performance
StreamSchema.index({ cohort: 1, track: 1 });
StreamSchema.index({ createdBy: 1 });
StreamSchema.index({ type: 1 });
StreamSchema.index({ isPublished: 1 });
StreamSchema.index({ scheduledFor: 1 });
StreamSchema.index({ createdAt: -1 });

export const Stream = mongoose.model<IStream>("Stream", StreamSchema);
