import { Request, Response } from "express";
import {
  brevoEmailService,
  EmailVariables,
} from "../services/brevoEmail.service";
import { AuthRequest } from "../middleware/auth";
import { asyncHandler } from "../utils/mongooseErrorHandler";
import { z } from "zod";
import convertMarkdownToHtml from "../utils/MarkdownToHtml";

// Send email directly with content from frontend
export const sendDirectEmail = asyncHandler(
  async (req: AuthRequest, res: Response) => {
    // Validate request body
    const { recipient, subject, content, contentType, variables } = req.body;

    try {
      let htmlContent = content;
      let textContent: string | undefined;

      // Convert markdown to HTML if needed
      if (contentType === "markdown") {
        htmlContent = convertMarkdownToHtml(content);
        textContent = content; // Keep original markdown as text version
      }

      // Send the email
      const success = await brevoEmailService.sendDirectEmail({
        recipient,
        subject,
        htmlContent,
        textContent,
        variables: variables as EmailVariables,
        metadata: {
          sentBy: req.user?.id,
          sentAt: new Date().toISOString(),
          contentType,
        },
      });

      if (success) {
        res.status(200).json({
          success: true,
          message: "Email sent successfully",
          data: {
            recipient: recipient.email,
            subject,
            sentAt: new Date().toISOString(),
          },
        });
      } else {
        res.status(500).json({
          success: false,
          message: "Failed to send email",
        });
      }
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "Unknown error";
      console.error("Error sending direct email:", errorMessage);

      res.status(500).json({
        success: false,
        message: "Failed to send email",
        error: errorMessage,
      });
    }
  },
);

/// Get email sending history
export const getEmailHistory = asyncHandler(
  async (req: AuthRequest, res: Response) => {
    const { page = 1, limit = 10, status } = req.query;

    // Build filter
    const filter: any = {};
    if (status) {
      filter.status = status;
    }

    const skip = (Number(page) - 1) * Number(limit);

    const { EmailLog } = await import("../models");

    const emails = await EmailLog.find(filter)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(Number(limit))
      .select(
        "recipientEmail recipientName subject status sentAt createdAt templateId errorMessage",
      );

    const total = await EmailLog.countDocuments(filter);

    res.status(200).json({
      success: true,
      message: "Email history retrieved successfully",
      data: {
        emails,
        pagination: {
          total,
          page: Number(page),
          limit: Number(limit),
          totalPages: Math.ceil(total / Number(limit)),
        },
      },
    });
  },
);

export const sendBulkEmails = asyncHandler(
  async (req: AuthRequest, res: Response) => {
    const { recipients, subject, content, contentType, globalVariables } =
      req.body;

    try {
      let htmlContent = content;
      let textContent: string | undefined;

      if (contentType === "markdown") {
        htmlContent = convertMarkdownToHtml(content);
        textContent = content;
      }

      const results = [];

      for (const recipient of recipients) {
        try {
          const success = await brevoEmailService.sendDirectEmail({
            recipient: {
              email: recipient.email,
              name: recipient.name,
              type: "external",
            },
            subject,
            htmlContent,
            textContent,
            variables: {
              ...globalVariables,
              ...recipient.variables,
            } as EmailVariables,
            metadata: {
              sentBy: req.user?.id,
              sentAt: new Date().toISOString(),
              contentType,
              bulkEmail: true,
            },
          });

          results.push({
            email: recipient.email,
            success,
            error: success ? null : "Failed to send",
          });
        } catch (error) {
          results.push({
            email: recipient.email,
            success: false,
            error: error instanceof Error ? error.message : "Unknown error",
          });
        }
      }

      const successCount = results.filter((r) => r.success).length;

      res.status(200).json({
        success: true,
        message: `Bulk email completed: ${successCount}/${recipients.length} emails sent`,
        data: {
          totalRecipients: recipients.length,
          successCount,
          failedCount: recipients.length - successCount,
          results,
        },
      });
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "Unknown error";
      console.error("Error sending bulk emails:", errorMessage);

      res.status(500).json({
        success: false,
        message: "Failed to send bulk emails",
        error: errorMessage,
      });
    }
  },
);
