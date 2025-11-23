import mongoose, { Schema, Document } from "mongoose";

export interface IEmailTemplate extends Document {
  name: string;
  subject: string;
  htmlContent: string;
  textContent?: string;
  templateType:
    | "application_confirmation"
    | "application_acceptance"
    | "application_rejection"
    | "assessment_invitation"
    | "assessment_confirmation"
    | "assessment_review"
    | "interview_scheduled_notification"
    | "interview_scheduled_confirmation"
    | "interview_result_notification"
    | "interview_cancellation_notification"
    | "interview_reminder_notification"
    | "password_reset"
    | "welcome_email"
    | "custom";
  variables: string[]; // List of available variables like {{applicantName}}, {{cohortName}}, etc.
  isActive: boolean;
  createdBy: mongoose.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const EmailTemplateSchema: Schema = new Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
      maxlength: 100,
    },
    subject: {
      type: String,
      required: true,
      trim: true,
      maxlength: 200,
    },
    htmlContent: {
      type: String,
      required: true,
    },
    textContent: {
      type: String,
      trim: true,
    },
    templateType: {
      type: String,
      enum: [
        "application_confirmation",
        "application_acceptance",
        "application_rejection",
        "assessment_invitation",
        "assessment_confirmation",
        "assessment_review",
        "interview_scheduled_notification",
        "interview_scheduled_confirmation",
        "interview_result_notification",
        "interview_cancellation_notification",
        "interview_reminder_notification",
        "password_reset",
        "welcome_email",
        "custom",
      ],
      required: true,
    },
    variables: [
      {
        type: String,
        trim: true,
      },
    ],
    isActive: {
      type: Boolean,
      default: true,
    },
    createdBy: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
  },
  {
    timestamps: true,
  },
);

// Compound index to ensure one active template per type
EmailTemplateSchema.index({ templateType: 1, isActive: 1 });

// Middleware to ensure only one active template per type
EmailTemplateSchema.pre("save", async function (next) {
  if (this.isNew || this.isModified("isActive")) {
    if (this.isActive) {
      // Deactivate other templates of the same type
      await mongoose.model("EmailTemplate").updateMany(
        {
          templateType: this.templateType,
          _id: { $ne: this._id },
          isActive: true,
        },
        { isActive: false },
      );
    }
  }
  next();
});

export const EmailTemplate = mongoose.model<IEmailTemplate>(
  "EmailTemplate",
  EmailTemplateSchema,
);
