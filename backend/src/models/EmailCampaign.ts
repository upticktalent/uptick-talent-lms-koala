import mongoose, { Schema, Document } from "mongoose";

export interface IEmailCampaign extends Document {
  name: string;
  description?: string;
  templateId: mongoose.Types.ObjectId;
  recipients: {
    type:
      | "all_applicants"
      | "cohort_applicants"
      | "custom_list"
      | "single_recipient";
    filters?: {
      cohortId?: mongoose.Types.ObjectId;
      trackId?: mongoose.Types.ObjectId;
      applicationStatus?: string;
      role?: string;
    };
    customEmails?: string[];
    singleEmail?: string;
  };
  scheduledFor?: Date;
  status: "draft" | "scheduled" | "sending" | "sent" | "cancelled";
  sentCount: number;
  failedCount: number;
  createdBy: mongoose.Types.ObjectId;
  sentAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

const EmailCampaignSchema: Schema = new Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
      maxlength: 100,
    },
    description: {
      type: String,
      trim: true,
      maxlength: 500,
    },
    templateId: {
      type: Schema.Types.ObjectId,
      ref: "EmailTemplate",
      required: true,
    },
    recipients: {
      type: {
        type: String,
        enum: [
          "all_applicants",
          "cohort_applicants",
          "custom_list",
          "single_recipient",
        ],
        required: true,
      },
      filters: {
        cohortId: {
          type: Schema.Types.ObjectId,
          ref: "Cohort",
        },
        trackId: {
          type: Schema.Types.ObjectId,
          ref: "Track",
        },
        applicationStatus: {
          type: String,
          enum: ["pending", "shortlisted", "accepted", "rejected"],
        },
        role: {
          type: String,
          enum: ["student", "mentor", "admin", "applicant"],
        },
      },
      customEmails: [
        {
          type: String,
          trim: true,
          lowercase: true,
        },
      ],
      singleEmail: {
        type: String,
        trim: true,
        lowercase: true,
      },
    },
    scheduledFor: {
      type: Date,
    },
    status: {
      type: String,
      enum: ["draft", "scheduled", "sending", "sent", "cancelled"],
      default: "draft",
    },
    sentCount: {
      type: Number,
      default: 0,
    },
    failedCount: {
      type: Number,
      default: 0,
    },
    createdBy: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    sentAt: {
      type: Date,
    },
  },
  {
    timestamps: true,
  },
);

// Index for querying campaigns by status and scheduled time
EmailCampaignSchema.index({ status: 1, scheduledFor: 1 });
EmailCampaignSchema.index({ createdBy: 1, createdAt: -1 });

export const EmailCampaign = mongoose.model<IEmailCampaign>(
  "EmailCampaign",
  EmailCampaignSchema,
);
