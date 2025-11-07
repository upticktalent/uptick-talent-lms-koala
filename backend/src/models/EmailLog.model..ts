import mongoose, { Schema, Document } from "mongoose";

export interface IEmailLog extends Document {
  campaignId?: mongoose.Types.ObjectId;
  templateId: mongoose.Types.ObjectId;
  recipientEmail: string;
  recipientName?: string;
  recipientId?: mongoose.Types.ObjectId; // User, Application, or other entity ID
  recipientType?: "user" | "applicant" | "external";
  subject: string;
  htmlContent: string;
  textContent?: string;
  status: "pending" | "sent" | "failed" | "bounced";
  errorMessage?: string;
  sentAt?: Date;
  openedAt?: Date;
  clickedAt?: Date;
  metadata?: {
    cohortId?: mongoose.Types.ObjectId;
    applicationId?: mongoose.Types.ObjectId;
    trackId?: mongoose.Types.ObjectId;
    [key: string]: any;
  };
  createdAt: Date;
  updatedAt: Date;
}

const EmailLogSchema: Schema = new Schema(
  {
    campaignId: {
      type: Schema.Types.ObjectId,
      ref: "EmailCampaign",
    },
    templateId: {
      type: Schema.Types.ObjectId,
      ref: "EmailTemplate",
    },
    recipientEmail: {
      type: String,
      required: true,
      trim: true,
      lowercase: true,
    },
    recipientName: {
      type: String,
      trim: true,
    },
    recipientId: {
      type: Schema.Types.ObjectId,
      refPath: "recipientType",
    },
    recipientType: {
      type: String,
      enum: ["user", "applicant", "external"],
    },
    subject: {
      type: String,
      required: true,
      trim: true,
    },
    htmlContent: {
      type: String,
      required: true,
    },
    textContent: {
      type: String,
      trim: true,
    },
    status: {
      type: String,
      enum: ["pending", "sent", "failed", "bounced"],
      default: "pending",
    },
    errorMessage: {
      type: String,
      trim: true,
    },
    sentAt: {
      type: Date,
    },
    openedAt: {
      type: Date,
    },
    clickedAt: {
      type: Date,
    },
    metadata: {
      cohortId: {
        type: Schema.Types.ObjectId,
        ref: "Cohort",
      },
      applicationId: {
        type: Schema.Types.ObjectId,
        ref: "Application",
      },
      trackId: {
        type: Schema.Types.ObjectId,
        ref: "Track",
      },
    },
  },
  {
    timestamps: true,
  },
);

// Indexes for efficient querying
EmailLogSchema.index({ recipientEmail: 1, createdAt: -1 });
EmailLogSchema.index({ campaignId: 1, status: 1 });
EmailLogSchema.index({ status: 1, createdAt: -1 });
EmailLogSchema.index({ templateId: 1, createdAt: -1 });

export const EmailLog = mongoose.model<IEmailLog>("EmailLog", EmailLogSchema);
