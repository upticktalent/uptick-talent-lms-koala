import * as brevo from "@getbrevo/brevo";
import { EmailTemplate, EmailLog, IEmailTemplate, IEmailLog } from "../models";
import { User, Application, Cohort, Track } from "../models";
import mongoose from "mongoose";

export interface EmailRecipient {
  email: string;
  name?: string;
  id?: string;
  type?: "user" | "applicant" | "external";
}

export interface EmailVariables {
  [key: string]: string | number | boolean;
}

export interface SendEmailOptions {
  templateType?: string;
  templateId?: string;
  recipient: EmailRecipient;
  variables?: EmailVariables;
  metadata?: {
    cohortId?: string;
    applicationId?: string;
    trackId?: string;
    [key: string]: any;
  };
}

class BrevoEmailService {
  private apiInstance: brevo.TransactionalEmailsApi;

  constructor() {
    // Initialize Brevo API client
    this.apiInstance = new brevo.TransactionalEmailsApi();

    // Set API key
    this.apiInstance.setApiKey(
      brevo.TransactionalEmailsApiApiKeys.apiKey,
      process.env.BREVO_API_KEY || "",
    );
  }

  // Get template by type or ID
  async getTemplate(
    templateType?: string,
    templateId?: string,
  ): Promise<IEmailTemplate | null> {
    try {
      if (templateId) {
        return await EmailTemplate.findById(templateId);
      }

      if (templateType) {
        return await EmailTemplate.findOne({
          templateType,
          isActive: true,
        });
      }

      throw new Error("Either templateType or templateId must be provided");
    } catch (error) {
      console.error("Error fetching email template:", error);
      return null;
    }
  }

  // Replace variables in template content
  private replaceVariables(content: string, variables: EmailVariables): string {
    let processedContent = content;

    Object.entries(variables).forEach(([key, value]) => {
      const regex = new RegExp(`{{\\s*${key}\\s*}}`, "g");
      processedContent = processedContent.replace(regex, String(value));
    });

    return processedContent;
  }

  // Get recipient data with personalization
  async getRecipientData(
    recipientId: string,
    recipientType: string,
  ): Promise<EmailVariables> {
    const baseData: EmailVariables = {
      currentDate: new Date().toLocaleDateString(),
      currentTime: new Date().toLocaleTimeString(),
      platformName: process.env.APP_NAME || "Uptick Talent",
      supportEmail: process.env.SUPPORT_EMAIL || "support@upticktalent.com",
      loginUrl: process.env.FRONTEND_URL || "http://localhost:3000",
    };

    try {
      if (recipientType === "user") {
        const user = await User.findById(recipientId);
        if (user) {
          return {
            ...baseData,
            recipientName: user.firstName + " " + user.lastName,
            recipientEmail: user.email,
            recipientRole: user.role,
          };
        }
      }

      if (recipientType === "applicant") {
        const application = await Application.findById(recipientId)
          .populate("applicant", "firstName lastName email")
          .populate("cohort", "name")
          .populate("track", "name");

        if (application && application.applicant) {
          const applicant = application.applicant as any;
          return {
            ...baseData,
            applicantName: `${applicant.firstName} ${applicant.lastName}`,
            applicantEmail: applicant.email,
            cohortName: (application.cohort as any)?.name || "",
            trackName: (application.track as any)?.name || "",
            applicationId: application._id.toString(),
            applicationStatus: application.status,
            applicationDate: application.createdAt.toLocaleDateString(),
          };
        }
      }

      return baseData;
    } catch (error) {
      console.error("Error fetching recipient data:", error);
      return baseData;
    }
  }

  // Send email using template
  async sendTemplatedEmail(options: SendEmailOptions): Promise<boolean> {
    try {
      // Get template
      const template = await this.getTemplate(
        options.templateType,
        options.templateId,
      );
      if (!template) {
        throw new Error(
          `Template not found: ${options.templateType || options.templateId}`,
        );
      }

      // Get recipient data for personalization
      let recipientData: EmailVariables = {};
      if (options.recipient.id && options.recipient.type) {
        recipientData = await this.getRecipientData(
          options.recipient.id,
          options.recipient.type,
        );
      }

      // Merge all variables
      const allVariables: EmailVariables = {
        ...recipientData,
        ...options.variables,
        recipientName:
          options.recipient.name || recipientData.recipientName || "",
        recipientEmail: options.recipient.email,
      };

      // Process template content
      const processedSubject = this.replaceVariables(
        template.subject,
        allVariables,
      );
      const processedHtml = this.replaceVariables(
        template.htmlContent,
        allVariables,
      );
      const processedText = template.textContent
        ? this.replaceVariables(template.textContent, allVariables)
        : undefined;

      // Create email log entry
      const emailLog = new EmailLog({
        templateId: template._id,
        recipientEmail: options.recipient.email,
        recipientName: options.recipient.name,
        recipientId: options.recipient.id
          ? new mongoose.Types.ObjectId(options.recipient.id)
          : undefined,
        recipientType: options.recipient.type,
        subject: processedSubject,
        htmlContent: processedHtml,
        textContent: processedText,
        status: "pending",
        metadata: options.metadata,
      });

      await emailLog.save();
      console.log(emailLog);

      // Send email via Brevo
      const sendSmtpEmail: brevo.SendSmtpEmail = {
        to: [
          {
            email: options.recipient.email,
            name: options.recipient.name,
          },
        ],
        subject: processedSubject,
        htmlContent: processedHtml,
        sender: {
          name: process.env.APP_NAME || "Uptick Talent",
          email: process.env.SENDER_EMAIL || "noreply@upticktalent.com",
        },
      };

      if (processedText) {
        sendSmtpEmail.textContent = processedText;
      }

      const result = await this.apiInstance.sendTransacEmail(sendSmtpEmail);

      // Update email log
      emailLog.status = "sent";
      emailLog.sentAt = new Date();
      await emailLog.save();

      console.log(`Email sent successfully to ${options.recipient.email}`);
      return true;
    } catch (error) {
      console.error("Error sending templated email:", error);

      // Update email log with error if it exists
      try {
        await EmailLog.findOneAndUpdate(
          {
            recipientEmail: options.recipient.email,
            status: "pending",
          },
          {
            status: "failed",
            errorMessage:
              error instanceof Error ? error.message : "Unknown error",
          },
          { sort: { createdAt: -1 } },
        );
      } catch (logError) {
        console.error("Error updating email log:", logError);
      }

      return false;
    }
  }

  // Send email directly with provided content (no template required)
  async sendDirectEmail(options: {
    recipient: EmailRecipient;
    subject: string;
    htmlContent: string;
    textContent?: string;
    variables?: EmailVariables;
    metadata?: { [key: string]: any };
  }): Promise<boolean> {
    try {
      // Get recipient data for personalization if ID provided
      let recipientData: EmailVariables = {};
      if (options.recipient.id && options.recipient.type) {
        recipientData = await this.getRecipientData(
          options.recipient.id,
          options.recipient.type,
        );
      }

      // Merge all variables
      const allVariables: EmailVariables = {
        ...recipientData,
        ...options.variables,
        recipientName:
          options.recipient.name || recipientData.recipientName || "",
        recipientEmail: options.recipient.email,
        currentDate: new Date().toLocaleDateString(),
        currentTime: new Date().toLocaleTimeString(),
        platformName: process.env.APP_NAME || "Uptick Talent",
        supportEmail: process.env.SUPPORT_EMAIL || "support@upticktalent.com",
        loginUrl: process.env.FRONTEND_URL || "http://localhost:3000",
      };

      // Process content with variables
      const processedSubject = this.replaceVariables(
        options.subject,
        allVariables,
      );
      const processedHtml = this.replaceVariables(
        options.htmlContent,
        allVariables,
      );
      const processedText = options.textContent
        ? this.replaceVariables(options.textContent, allVariables)
        : undefined;

      // Create email log entry (without template reference)
      const emailLog = new EmailLog({
        recipientEmail: options.recipient.email,
        recipientName: options.recipient.name,
        recipientId: options.recipient.id
          ? new mongoose.Types.ObjectId(options.recipient.id)
          : undefined,
        recipientType: options.recipient.type,
        subject: processedSubject,
        htmlContent: processedHtml,
        textContent: processedText,
        status: "pending",
        metadata: options.metadata,
      });

      await emailLog.save();

      // Send email via Brevo
      const sendSmtpEmail: brevo.SendSmtpEmail = {
        to: [
          {
            email: options.recipient.email,
            name: options.recipient.name,
          },
        ],
        subject: processedSubject,
        htmlContent: processedHtml,
        sender: {
          name: process.env.APP_NAME || "Uptick Talent",
          email: process.env.SENDER_EMAIL || "noreply@upticktalent.com",
        },
      };

      if (processedText) {
        sendSmtpEmail.textContent = processedText;
      }

      const result = await this.apiInstance.sendTransacEmail(sendSmtpEmail);

      // Update email log
      emailLog.status = "sent";
      emailLog.sentAt = new Date();
      await emailLog.save();

      console.log(
        `Direct email sent successfully to ${options.recipient.email}`,
      );
      return true;
    } catch (error) {
      console.error("Error sending direct email:", error);

      // Update email log with error if it exists
      try {
        await EmailLog.findOneAndUpdate(
          {
            recipientEmail: options.recipient.email,
            status: "pending",
          },
          {
            status: "failed",
            errorMessage:
              error instanceof Error ? error.message : "Unknown error",
          },
          { sort: { createdAt: -1 } },
        );
      } catch (logError) {
        console.error("Error updating email log:", logError);
      }

      return false;
    }
  }

  // Backward compatibility methods
  async sendApplicationConfirmation(
    applicantEmail: string,
    applicantName: string,
    cohortName: string,
    applicationId?: string,
  ): Promise<void> {
    await this.sendTemplatedEmail({
      templateType: "application_confirmation",
      recipient: {
        email: applicantEmail,
        name: applicantName,
        id: applicationId,
        type: "applicant",
      },
      variables: {
        cohortName,
      },
      metadata: {
        applicationId,
      },
    });
  }

  async sendAcceptanceEmail(
    applicantEmail: string,
    applicantName: string,
    cohortName: string,
    password: string,
    applicationId?: string,
  ): Promise<void> {
    await this.sendTemplatedEmail({
      templateType: "application_acceptance",
      recipient: {
        email: applicantEmail,
        name: applicantName,
        id: applicationId,
        type: "applicant",
      },
      variables: {
        cohortName,
        temporaryPassword: password,
      },
      metadata: {
        applicationId,
      },
    });
  }

  async sendRejectionEmail(
    applicantEmail: string,
    applicantName: string,
    cohortName: string,
    reason?: string,
    applicationId?: string,
  ): Promise<void> {
    await this.sendTemplatedEmail({
      templateType: "application_rejection",
      recipient: {
        email: applicantEmail,
        name: applicantName,
        id: applicationId,
        type: "applicant",
      },
      variables: {
        cohortName,
        rejectionReason: reason || "",
      },
      metadata: {
        applicationId,
      },
    });
  }

  async sendAssessmentEmail(
    applicantEmail: string,
    applicantName: string,
    cohortName: string,
    assessmentLink: string,
    applicationId?: string,
  ): Promise<void> {
    await this.sendTemplatedEmail({
      templateType: "assessment_invitation",
      recipient: {
        email: applicantEmail,
        name: applicantName,
        id: applicationId,
        type: "applicant",
      },
      variables: {
        cohortName,
        assessmentLink,
      },
      metadata: {
        applicationId,
      },
    });
  }

  async sendAssessmentConfirmation(
    applicantEmail: string,
    applicantName: string,
    trackName: string,
    submissionType: string,
    applicationId?: string,
  ): Promise<void> {
    await this.sendTemplatedEmail({
      templateType: "assessment_confirmation",
      recipient: {
        email: applicantEmail,
        name: applicantName,
        id: applicationId,
        type: "applicant",
      },
      variables: {
        trackName,
        submissionType:
          submissionType === "file" ? "File Upload" : "Link Submission",
      },
      metadata: {
        applicationId,
      },
    });
  }

  async sendAssessmentReviewNotification(
    applicantEmail: string,
    applicantName: string,
    trackName: string,
    status: string,
    score?: number,
    applicationId?: string,
  ): Promise<void> {
    await this.sendTemplatedEmail({
      templateType: "assessment_review",
      recipient: {
        email: applicantEmail,
        name: applicantName,
        id: applicationId,
        type: "applicant",
      },
      variables: {
        trackName,
        reviewStatus: status,
        score: score?.toString() || "",
      },
      metadata: {
        applicationId,
      },
    });
  }

  async sendWelcomeEmail(
    userEmail: string,
    userName: string,
    role: string,
    password: string,
    assignedTracks?: string,
    userId?: string,
  ): Promise<void> {
    await this.sendTemplatedEmail({
      templateType: "welcome_email",
      recipient: {
        email: userEmail,
        name: userName,
        id: userId,
        type: "user",
      },
      variables: {
        userRole: role,
        temporaryPassword: password,
        assignedTracks: assignedTracks || "",
      },
      metadata: {
        userId,
      },
    });
  }
}

export const brevoEmailService = new BrevoEmailService();
