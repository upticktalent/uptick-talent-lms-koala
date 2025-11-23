import { Response } from "express";
import {
  EmailTemplate,
  EmailCampaign,
  EmailLog,
  User,
  Application,
} from "../models";
import { brevoEmailService } from "../services/brevoEmail.service";
import { AuthRequest } from "../middleware/auth";
import mongoose from "mongoose";

// Get all email templates
export const getEmailTemplates = async (req: AuthRequest, res: Response) => {
  try {
    const { templateType, isActive } = req.query;

    const filter: any = {};
    if (templateType) filter.templateType = templateType;
    if (isActive !== undefined) filter.isActive = isActive === "true";

    const templates = await EmailTemplate.find(filter)
      .populate("createdBy", "name email")
      .sort({ createdAt: -1 });

    return res.status(200).json({
      success: true,
      message: "Email templates retrieved successfully",
      data: templates,
    });
  } catch (error) {
    console.error("Error fetching email templates:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to fetch email templates",
    });
  }
};

// Get single email template
export const getEmailTemplate = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;

    const template = await EmailTemplate.findById(id).populate(
      "createdBy",
      " firstName lastName email",
    );

    if (!template) {
      return res.status(404).json({
        success: false,
        message: "Email template not found",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Email template retrieved successfully",
      data: template,
    });
  } catch (error) {
    console.error("Error fetching email template:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to fetch email template",
    });
  }
};

// Create new email template
export const createEmailTemplate = async (req: AuthRequest, res: Response) => {
  try {
    const { name, subject, htmlContent, textContent, templateType, variables } =
      req.body;
    const userId = req.user?.id;

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: "User not authenticated",
      });
    }

    const template = new EmailTemplate({
      name,
      subject,
      htmlContent,
      textContent,
      templateType,
      variables: variables || [],
      createdBy: userId,
    });

    await template.save();
    await template.populate("createdBy", " firstName lastName email");

    return res.status(201).json({
      success: true,
      message: "Email template created successfully",
      data: template,
    });
  } catch (error) {
    console.error("Error creating email template:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to create email template",
    });
  }
};

// Update email template
export const updateEmailTemplate = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const { name, subject, htmlContent, textContent, variables, isActive } =
      req.body;

    const template = await EmailTemplate.findByIdAndUpdate(
      id,
      {
        name,
        subject,
        htmlContent,
        textContent,
        variables: variables || [],
        isActive,
      },
      { new: true, runValidators: true },
    ).populate("createdBy", " firstName lastName email");

    if (!template) {
      return res.status(404).json({
        success: false,
        message: "Email template not found",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Email template updated successfully",
      data: template,
    });
  } catch (error) {
    console.error("Error updating email template:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to update email template",
    });
  }
};

// Delete email template
export const deleteEmailTemplate = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;

    const template = await EmailTemplate.findByIdAndDelete(id);

    if (!template) {
      return res.status(404).json({
        success: false,
        message: "Email template not found",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Email template deleted successfully",
    });
  } catch (error) {
    console.error("Error deleting email template:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to delete email template",
    });
  }
};

// Preview email template with sample data
export const previewEmailTemplate = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const { sampleData } = req.body;

    const template = await EmailTemplate.findById(id);
    if (!template) {
      return res.status(404).json({
        success: false,
        message: "Email template not found",
      });
    }

    // Default sample data
    const defaultSampleData = {
      recipientName: "John Doe",
      recipientEmail: "john.doe@example.com",
      applicantName: "John Doe",
      cohortName: "Full Stack Development Cohort 2024",
      trackName: "Backend Development",
      platformName: "Uptick Talent",
      currentDate: new Date().toLocaleDateString(),
      loginUrl: process.env.FRONTEND_URL || "http://localhost:3000",
      temporaryPassword: "TempPass123!",
      assessmentLink: "https://platform.upticktalent.com/assessment/abc123",
      submissionType: "File Upload",
      reviewStatus: "reviewed",
      score: "85",
    };

    const variables = { ...defaultSampleData, ...sampleData };

    // Replace variables in content
    let processedSubject = template.subject;
    let processedHtml = template.htmlContent;
    let processedText = template.textContent || "";

    Object.entries(variables).forEach(([key, value]) => {
      const regex = new RegExp(`{{\\s*${key}\\s*}}`, "g");
      processedSubject = processedSubject.replace(regex, String(value));
      processedHtml = processedHtml.replace(regex, String(value));
      processedText = processedText.replace(regex, String(value));
    });

    const preview = {
      subject: processedSubject,
      htmlContent: processedHtml,
      textContent: processedText,
      variables: template.variables,
      sampleData: variables,
    };

    return res.status(200).json({
      success: true,
      message: "Email template preview generated",
      data: preview,
    });
  } catch (error) {
    console.error("Error generating email preview:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to generate email preview",
    });
  }
};

// Send test email
export const sendTestEmail = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const { testEmail, sampleData } = req.body;

    if (!testEmail) {
      return res.status(400).json({
        success: false,
        message: "Test email address is required",
      });
    }

    const success = await brevoEmailService.sendTemplatedEmail({
      templateId: id,
      recipient: {
        email: testEmail,
        name: "Test Recipient",
        type: "external",
      },
      variables: sampleData || {},
    });

    if (success) {
      return res.status(200).json({
        success: true,
        message: "Test email sent successfully",
      });
    } else {
      return res.status(500).json({
        success: false,
        message: "Failed to send test email",
      });
    }
  } catch (error) {
    console.error("Error sending test email:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to send test email",
    });
  }
};

// Get available template variables and recipient data
export const getTemplateVariables = async (req: AuthRequest, res: Response) => {
  try {
    const variables = {
      common: [
        "recipientName",
        "recipientEmail",
        "platformName",
        "currentDate",
        "currentTime",
        "supportEmail",
        "loginUrl",
      ],
      applicant: [
        "applicantName",
        "applicantEmail",
        "cohortName",
        "trackName",
        "applicationId",
        "applicationStatus",
        "applicationDate",
      ],
      user: ["recipientRole", "userRole"],
      auth: ["temporaryPassword"],
      assessment: ["assessmentLink", "submissionType", "reviewStatus", "score"],
      custom: ["rejectionReason", "assignedTracks"],
    };

    return res.status(200).json({
      success: true,
      message: "Template variables retrieved successfully",
      data: variables,
    });
  } catch (error) {
    console.error("Error fetching template variables:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to fetch template variables",
    });
  }
};

// Get recipients for email campaigns
export const getEmailRecipients = async (req: AuthRequest, res: Response) => {
  try {
    const { type, cohortId, trackId, applicationStatus } = req.query;

    let recipients: any[] = [];

    if (type === "all_applicants") {
      const filter: any = {};
      if (cohortId) filter.cohort = cohortId;
      if (trackId) filter.track = trackId;
      if (applicationStatus) filter.status = applicationStatus;

      const applications = await Application.find(filter)
        .populate("applicant", "firstName lastName email")
        .populate("cohort", "name")
        .populate("track", "name")
        .lean();

      recipients = applications.map((app) => {
        const applicant = app.applicant as any;
        return {
          id: app._id,
          name: `${applicant.firstName} ${applicant.lastName}`,
          email: applicant.email,
          type: "applicant",
          metadata: {
            cohortName: (app.cohort as any)?.name,
            trackName: (app.track as any)?.name,
            status: app.status,
          },
        };
      });
    }

    if (type === "users") {
      const filter: any = {};
      if (req.query.role) filter.role = req.query.role;

      recipients = await User.find(filter).select(" firstName lastName email role").lean();

      recipients = recipients.map((user) => ({
        id: user._id,
        name: `${user.firstName} ${user.lastName}`,
        email: user.email,
        type: "user",
        metadata: {
          role: user.role,
        },
      }));
    }

    return res.status(200).json({
      success: true,
      message: "Recipients retrieved successfully",
      data: {
        count: recipients.length,
        recipients,
      },
    });
  } catch (error) {
    console.error("Error fetching email recipients:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to fetch email recipients",
    });
  }
};

// Send email to single recipient
export const sendSingleEmail = async (req: AuthRequest, res: Response) => {
  try {
    const {
      templateId,
      recipientEmail,
      recipientName,
      recipientId,
      recipientType,
      customVariables,
    } = req.body;

    if (!templateId || !recipientEmail) {
      return res.status(400).json({
        success: false,
        message: "Template ID and recipient email are required",
      });
    }

    const success = await brevoEmailService.sendTemplatedEmail({
      templateId,
      recipient: {
        email: recipientEmail,
        name: recipientName,
        id: recipientId,
        type: recipientType || "external",
      },
      variables: customVariables || {},
    });

    if (success) {
      return res.status(200).json({
        success: true,
        message: "Email sent successfully",
      });
    } else {
      return res.status(500).json({
        success: false,
        message: "Failed to send email",
      });
    }
  } catch (error) {
    console.error("Error sending single email:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to send email",
    });
  }
};

// Get email logs/history
export const getEmailLogs = async (req: AuthRequest, res: Response) => {
  try {
    const {
      page = 1,
      limit = 20,
      templateId,
      recipientEmail,
      status,
      startDate,
      endDate,
    } = req.query;

    const filter: any = {};
    if (templateId) filter.templateId = templateId;
    if (recipientEmail)
      filter.recipientEmail = new RegExp(recipientEmail as string, "i");
    if (status) filter.status = status;

    if (startDate || endDate) {
      filter.createdAt = {};
      if (startDate) filter.createdAt.$gte = new Date(startDate as string);
      if (endDate) filter.createdAt.$lte = new Date(endDate as string);
    }

    const skip = (Number(page) - 1) * Number(limit);

    const [logs, total] = await Promise.all([
      EmailLog.find(filter)
        .populate("templateId", "name templateType")
        .populate("campaignId", "name")
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(Number(limit)),
      EmailLog.countDocuments(filter),
    ]);

    const pagination = {
      current: Number(page),
      pages: Math.ceil(total / Number(limit)),
      total,
      hasNext: skip + logs.length < total,
      hasPrev: Number(page) > 1,
    };

    return res.status(200).json({
      success: true,
      message: "Email logs retrieved successfully",
      data: {
        logs,
        pagination,
      },
    });
  } catch (error) {
    console.error("Error fetching email logs:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to fetch email logs",
    });
  }
};
