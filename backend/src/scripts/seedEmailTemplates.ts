import { EmailTemplate } from "../models/EmailTemplate.model";
import mongoose from "mongoose";

// Default email templates for the system
export const seedEmailTemplates = async (adminId:string) => {
  try {
    console.log("Seeding email templates...");

    // Create admin user ID for seeding (will be replaced with actual admin ID in production)
   
    const defaultTemplates = [
      {
        name: "Application Confirmation",
        subject: "Application Received - {{platformName}}",
        htmlContent: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h2 style="color: #2563eb;">Application Received Successfully!</h2>
            <p>Dear {{applicantName}},</p>
            <p>Thank you for applying to join the <strong>{{cohortName}}</strong> cohort at {{platformName}}.</p>
            <p>Your application has been received and is currently under review. Our team will carefully evaluate your application and get back to you soon.</p>
            
            <div style="background-color: #dbeafe; padding: 20px; margin: 20px 0; border-radius: 8px; border-left: 4px solid #2563eb;">
              <h3 style="margin-top: 0; color: #1e40af;">📋 Your Application ID</h3>
              <p style="font-size: 18px; font-weight: bold; color: #1e40af; font-family: monospace; background-color: #fff; padding: 10px; border-radius: 4px; text-align: center;">{{applicationId}}</p>
              <p style="color: #dc2626; font-weight: 600;">⚠️ Please keep this Application ID safe and secure. You will need it for all subsequent processes including assessments, interviews, and communications.</p>
            </div>
            
            <div style="background-color: #f3f4f6; padding: 20px; margin: 20px 0; border-radius: 8px;">
              <h3 style="margin-top: 0;">What happens next?</h3>
              <ul>
                <li>Our mentors will review your application and CV</li>
                <li>You'll receive an email notification with the decision</li>
                <li>If accepted, you'll receive login credentials to access the platform</li>
              </ul>
            </div>
            
            <p>If you have any questions, please don't hesitate to contact us at {{supportEmail}}.</p>
            <p>Best regards,<br>The {{platformName}} Team</p>
          </div>
        `,
        templateType: "application_confirmation",
        variables: [
          "applicantName",
          "cohortName",
          "platformName",
          "supportEmail",
          "applicationId",
        ],
        createdBy: adminId,
      },
      {
        name: "Application Acceptance",
        subject: "🎉 Congratulations! You've been accepted - {{platformName}}",
        htmlContent: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h2 style="color: #16a34a;">🎉 Congratulations! You've been accepted!</h2>
            <p>Dear {{applicantName}},</p>
            <p>We're excited to inform you that you have been <strong>accepted</strong> into the <strong>{{cohortName}}</strong> cohort at {{platformName}}!</p>
            
            <div style="background-color: #dcfce7; padding: 20px; margin: 20px 0; border-radius: 8px; border-left: 4px solid #16a34a;">
              <h3 style="margin-top: 0; color: #15803d;">Your Login Credentials</h3>
              <p><strong>Email:</strong> {{recipientEmail}}</p>
              <p><strong>Temporary Password:</strong> <code style="background-color: #fff; padding: 4px 8px; border-radius: 4px; font-family: monospace;">{{temporaryPassword}}</code></p>
              <p><strong>Login URL:</strong> <a href="{{loginUrl}}/login" style="color: #2563eb;">{{loginUrl}}/login</a></p>
            </div>

            <div style="background-color: #fef3c7; padding: 20px; margin: 20px 0; border-radius: 8px; border-left: 4px solid #f59e0b;">
              <h3 style="margin-top: 0; color: #d97706;">Important Security Notice</h3>
              <p>⚠️ This is a temporary password. For your security, you'll be required to change it upon your first login.</p>
            </div>

            <p>Welcome to the {{platformName}} community! We're thrilled to have you on board.</p>
            <p>Best regards,<br>The {{platformName}} Team</p>
          </div>
        `,
        templateType: "application_acceptance",
        variables: [
          "applicantName",
          "cohortName",
          "platformName",
          "recipientEmail",
          "temporaryPassword",
          "loginUrl",
        ],
        createdBy: adminId,
      },
      {
        name: "Application Rejection",
        subject: "Application Update - {{platformName}}",
        htmlContent: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h2 style="color: #dc2626;">Application Update</h2>
            <p>Dear {{applicantName}},</p>
            <p>Thank you for your interest in joining the <strong>{{cohortName}}</strong> cohort at {{platformName}}.</p>
            <p>After careful consideration, we regret to inform you that your application was not selected for this cohort.</p>
            
            {{#if rejectionReason}}
            <div style="background-color: #fef2f2; padding: 20px; margin: 20px 0; border-radius: 8px; border-left: 4px solid #dc2626;">
              <h3 style="margin-top: 0; color: #dc2626;">Feedback</h3>
              <p>{{rejectionReason}}</p>
            </div>
            {{/if}}
            
            <div style="background-color: #f0f9ff; padding: 20px; margin: 20px 0; border-radius: 8px; border-left: 4px solid #2563eb;">
              <h3 style="margin-top: 0; color: #1d4ed8;">Don't Give Up!</h3>
              <p>We encourage you to apply for future cohorts. Keep developing your skills and consider the feedback provided.</p>
            </div>
            
            <p>Thank you again for your interest in {{platformName}}.</p>
            <p>Best regards,<br>The {{platformName}} Team</p>
          </div>
        `,
        templateType: "application_rejection",
        variables: [
          "applicantName",
          "cohortName",
          "platformName",
          "rejectionReason",
        ],
        createdBy: adminId,
      },
      {
        name: "Assessment Invitation",
        subject: "Assessment Required - {{cohortName}} Application",
        htmlContent: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h2 style="color: #2c3e50;">Congratulations! You've Been Shortlisted</h2>
            <p>Dear {{applicantName}},</p>
            <p>Great news! Your application for the <strong>{{cohortName}}</strong> program has been reviewed and you've been <strong>shortlisted</strong> for the next stage.</p>
            <p>To proceed with your application, you are required to complete an assessment.</p>
            
            <div style="background-color: #f8f9fa; padding: 20px; border-radius: 5px; margin: 20px 0;">
              <h3 style="color: #2c3e50; margin-top: 0;">Assessment Details:</h3>
              <p><strong>Program:</strong> {{cohortName}}</p>
              <p><strong>Status:</strong> Shortlisted</p>
              <p><strong>Next Step:</strong> Complete Assessment</p>
            </div>
            
            <div style="text-align: center; margin: 30px 0;">
              <a href="{{assessmentLink}}" 
                 style="background-color: #3498db; color: white; padding: 12px 30px; 
                        text-decoration: none; border-radius: 5px; display: inline-block;
                        font-weight: bold;">
                Start Assessment
              </a>
            </div>
            
            <p>Best of luck with your assessment!</p>
            <p>Best regards,<br>The {{platformName}} Team</p>
          </div>
        `,
        templateType: "assessment_invitation",
        variables: [
          "applicantName",
          "cohortName",
          "assessmentLink",
          "platformName",
        ],
        createdBy: adminId,
      },
      {
        name: "Assessment Confirmation",
        subject: "Assessment Submitted Successfully - {{trackName}}",
        htmlContent: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h2 style="color: #27ae60;">Assessment Submitted Successfully!</h2>
            <p>Dear {{applicantName}},</p>
            <p>Thank you for submitting your assessment for the <strong>{{trackName}}</strong> program. We have successfully received your submission.</p>
            
            <div style="background-color: #f8f9fa; padding: 20px; border-radius: 5px; margin: 20px 0;">
              <h3 style="color: #2c3e50; margin-top: 0;">Submission Details:</h3>
              <p><strong>Program:</strong> {{trackName}}</p>
              <p><strong>Submission Type:</strong> {{submissionType}}</p>
              <p><strong>Status:</strong> Submitted</p>
              <p><strong>Submitted At:</strong> {{currentDate}}</p>
            </div>
            
            <div style="background-color: #e8f5e8; padding: 15px; border-radius: 5px; margin: 20px 0;">
              <h4 style="color: #27ae60; margin-top: 0;">What happens next?</h4>
              <ul style="margin: 10px 0;">
                <li>Our team will review your assessment</li>
                <li>You will receive an email notification once the review is complete</li>
                <li>The review process typically takes 3-5 business days</li>
              </ul>
            </div>
            
            <p>Thank you for your interest in joining our program!</p>
            <p>Best regards,<br>The {{platformName}} Team</p>
          </div>
        `,
        templateType: "assessment_confirmation",
        variables: [
          "applicantName",
          "trackName",
          "submissionType",
          "currentDate",
          "platformName",
        ],
        createdBy: adminId,
      },
      {
        name: "Assessment Review Complete",
        subject: "Assessment Review Complete - {{trackName}}",
        htmlContent: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h2 style="color: #27ae60;">Assessment Review Complete</h2>
            <p>Dear {{applicantName}},</p>
            <p>We have completed the review of your assessment for the <strong>{{trackName}}</strong> program.</p>
            
            <div style="background-color: #f8f9fa; padding: 20px; border-radius: 5px; margin: 20px 0;">
              <h3 style="color: #2c3e50; margin-top: 0;">Review Results:</h3>
              <p><strong>Program:</strong> {{trackName}}</p>
              <p><strong>Status:</strong> {{reviewStatus}}</p>
              {{#if score}}<p><strong>Score:</strong> {{score}}/100</p>{{/if}}
              <p><strong>Reviewed At:</strong> {{currentDate}}</p>
            </div>
            
            <p>Our admissions team will now make the final decision on your application. You will receive a notification about the final outcome within the next few days.</p>
            <p>Thank you for your patience during the review process.</p>
            <p>Best regards,<br>The {{platformName}} Team</p>
          </div>
        `,
        templateType: "assessment_review",
        variables: [
          "applicantName",
          "trackName",
          "reviewStatus",
          "score",
          "currentDate",
          "platformName",
        ],
        createdBy: adminId,
      },
      {
        name: "Welcome Email",
        subject: "Welcome to {{platformName}} - {{userRole}} Account Created",
        htmlContent: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h2 style="color: #16a34a;">🎉 Welcome to {{platformName}}!</h2>
            <p>Dear {{recipientName}},</p>
            <p>Your <strong>{{userRole}}</strong> account has been created successfully for the {{platformName}} Learning Management System.</p>
            
            <div style="background-color: #dcfce7; padding: 20px; margin: 20px 0; border-radius: 8px; border-left: 4px solid #16a34a;">
              <h3 style="margin-top: 0; color: #15803d;">Your Login Credentials</h3>
              <p><strong>Email:</strong> {{recipientEmail}}</p>
              <p><strong>Temporary Password:</strong> <code style="background-color: #fff; padding: 4px 8px; border-radius: 4px; font-family: monospace;">{{temporaryPassword}}</code></p>
              <p><strong>Login URL:</strong> <a href="{{loginUrl}}/login" style="color: #2563eb;">{{loginUrl}}/login</a></p>
            </div>

            {{#if assignedTracks}}
            <div style="background-color: #f0f9ff; padding: 20px; margin: 20px 0; border-radius: 8px; border-left: 4px solid #2563eb;">
              <h3 style="margin-top: 0; color: #1d4ed8;">Your Assigned Tracks</h3>
              <p><strong>Tracks:</strong> {{assignedTracks}}</p>
            </div>
            {{/if}}

            <div style="background-color: #fef3c7; padding: 20px; margin: 20px 0; border-radius: 8px; border-left: 4px solid #f59e0b;">
              <h3 style="margin-top: 0; color: #d97706;">Important Security Notice</h3>
              <p>⚠️ This is a temporary password. For your security, you'll be required to change it upon your first login.</p>
            </div>

            <p>If you have any questions, please contact our support team at {{supportEmail}}.</p>
            <p>Best regards,<br>The {{platformName}} Team</p>
          </div>
        `,
        templateType: "welcome_email",
        variables: [
          "recipientName",
          "userRole",
          "platformName",
          "recipientEmail",
          "temporaryPassword",
          "loginUrl",
          "assignedTracks",
          "supportEmail",
        ],
        createdBy: adminId,
      },
      {
        name: "Interview Scheduled - Applicant Confirmation",
        subject: "🎯 Your Interview is Scheduled - {{trackName}} Program",
        htmlContent: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h2 style="color: #2563eb;">🎯 Your Interview is Scheduled!</h2>
            <p>Dear {{applicantName}},</p>
            <p>Great news! Your interview for the <strong>{{trackName}}</strong> program has been scheduled.</p>
            
            <div style="background-color: #f3f4f6; padding: 20px; margin: 20px 0; border-radius: 8px;">
              <h3 style="margin-top: 0; color: #1f2937;">📅 Interview Details</h3>
              <ul style="list-style: none; padding: 0;">
                <li style="margin: 10px 0;"><strong>Date:</strong> {{interviewDate}}</li>
                <li style="margin: 10px 0;"><strong>Time:</strong> {{interviewTime}}</li>
                <li style="margin: 10px 0;"><strong>Duration:</strong> 30 minutes</li>
                <li style="margin: 10px 0;"><strong>Location:</strong> {{location}}</li>
                {{#if meetingLink}}
                <li style="margin: 10px 0;"><strong>Meeting Link:</strong> <a href="{{meetingLink}}" style="color: #2563eb;">Join Meeting</a></li>
                {{/if}}
                <li style="margin: 10px 0;"><strong>Interviewer:</strong> {{interviewerName}}</li>
              </ul>
            </div>
            
            <div style="background-color: #dbeafe; padding: 20px; margin: 20px 0; border-radius: 8px;">
              <h3 style="margin-top: 0; color: #1e40af;">💡 Interview Tips</h3>
              <ul>
                <li>Join the meeting 5 minutes early</li>
                <li>Test your camera and microphone beforehand</li>
                <li>Have your CV and portfolio ready</li>
                <li>Prepare questions about the program</li>
                <li>Be ready to discuss your motivation and goals</li>
              </ul>
            </div>
            
            <p>We're excited to meet you and learn more about your journey. Good luck!</p>
            <p>If you need to reschedule or have any questions, please contact us immediately.</p>
            <p>Best regards,<br>The {{platformName}} Team</p>
          </div>
        `,
        templateType: "interview_scheduled_confirmation",
        variables: [
          "applicantName",
          "trackName",
          "interviewDate",
          "interviewTime",
          "location",
          "meetingLink",
          "interviewerName",
          "platformName",
        ],
        createdBy: adminId,
      },
      {
        name: "Interview Scheduled - Interviewer Notification",
        subject: "📋 New Interview Scheduled - {{trackName}} Applicant",
        htmlContent: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h2 style="color: #059669;">📋 New Interview Scheduled</h2>
            <p>Hello {{interviewerName}},</p>
            <p>A new interview has been scheduled with an applicant for the <strong>{{trackName}}</strong> program.</p>
            
            <div style="background-color: #f3f4f6; padding: 20px; margin: 20px 0; border-radius: 8px;">
              <h3 style="margin-top: 0; color: #1f2937;">👤 Applicant Information</h3>
              <ul style="list-style: none; padding: 0;">
                <li style="margin: 10px 0;"><strong>Name:</strong> {{applicantName}}</li>
                <li style="margin: 10px 0;"><strong>Program:</strong> {{trackName}}</li>
                <li style="margin: 10px 0;"><strong>Application ID:</strong> {{applicationId}}</li>
              </ul>
            </div>
            
            <div style="background-color: #ecfdf5; padding: 20px; margin: 20px 0; border-radius: 8px;">
              <h3 style="margin-top: 0; color: #065f46;">📅 Interview Details</h3>
              <ul style="list-style: none; padding: 0;">
                <li style="margin: 10px 0;"><strong>Date:</strong> {{interviewDate}}</li>
                <li style="margin: 10px 0;"><strong>Time:</strong> {{interviewTime}}</li>
                <li style="margin: 10px 0;"><strong>Duration:</strong> 30 minutes</li>
                <li style="margin: 10px 0;"><strong>Location:</strong> {{location}}</li>
                {{#if meetingLink}}
                <li style="margin: 10px 0;"><strong>Meeting Link:</strong> <a href="{{meetingLink}}" style="color: #059669;">Join Meeting</a></li>
                {{/if}}
              </ul>
            </div>
            
            <div style="background-color: #fef3c7; padding: 20px; margin: 20px 0; border-radius: 8px;">
              <h3 style="margin-top: 0; color: #92400e;">📝 Interview Preparation</h3>
              <ul>
                <li>Review the applicant's CV and application</li>
                <li>Prepare questions about their technical skills</li>
                <li>Assess their motivation and fit for the program</li>
                <li>Be ready to answer questions about the program</li>
              </ul>
            </div>
            
            <p>The calendar invite is attached to help you add this to your schedule.</p>
            <p>Thank you for your time and contribution to our program!</p>
            <p>Best regards,<br>The {{platformName}} Team</p>
          </div>
        `,
        templateType: "interview_scheduled_notification",
        variables: [
          "interviewerName",
          "applicantName",
          "trackName",
          "applicationId",
          "interviewDate",
          "interviewTime",
          "location",
          "meetingLink",
          "platformName",
        ],
        createdBy: adminId,
      },
      {
        name: "Interview Result Notification",
        subject: "Interview Result - {{platformName}}",
        htmlContent: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h2 style="color: #2563eb;">Interview Result Update</h2>
            <p>Dear {{applicantName}},</p>
            <p>We wanted to update you on the status of your interview for the <strong>{{trackName}}</strong> track.</p>
            
            <div style="background-color: #f3f4f6; padding: 20px; margin: 20px 0; border-radius: 8px;">
              <h3 style="margin-top: 0;">Interview Details:</h3>
              <p><strong>Date:</strong> {{interviewDate}}</p>
              <p><strong>Time:</strong> {{interviewTime}}</p>
              <p><strong>Interviewer:</strong> {{mentorName}}</p>
              <p><strong>Status:</strong> {{interviewStatus}}</p>
            </div>
            
            <p>{{interviewFeedback}}</p>
            
            <p>If you have any questions, please contact us at {{supportEmail}}.</p>
            <p>Best regards,<br>The {{platformName}} Team</p>
          </div>
        `,
        templateType: "interview_result_notification",
        variables: ["applicantName", "trackName", "interviewDate", "interviewTime", "mentorName", "interviewStatus", "interviewFeedback", "platformName", "supportEmail"],
        createdBy: adminId,
      },
      {
        name: "Password Reset Request",
        subject: "Password Reset - {{platformName}}",
        htmlContent: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h2 style="color: #2563eb;">Password Reset Request</h2>
            <p>Dear {{recipientName}},</p>
            <p>We received a request to reset your password for your {{platformName}} account.</p>
            
            <div style="background-color: #dbeafe; padding: 20px; margin: 20px 0; border-radius: 8px; text-align: center;">
              <p>Click the button below to reset your password:</p>
              <a href="{{resetLink}}" style="background-color: #2563eb; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block; margin: 10px 0;">Reset Password</a>
              <p style="font-size: 14px; color: #6b7280;">This link will expire in 24 hours.</p>
            </div>
            
            <p style="font-size: 14px; color: #6b7280;">If you didn't request this password reset, please ignore this email or contact us at {{supportEmail}} if you have concerns.</p>
            <p>Best regards,<br>The {{platformName}} Team</p>
          </div>
        `,
        templateType: "password_reset",
        variables: ["recipientName", "resetLink", "platformName", "supportEmail"],
        createdBy: adminId,
      },
      {
        name: "Interview Cancellation Notification",
        subject: "Interview Cancelled - {{platformName}}",
        htmlContent: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h2 style="color: #dc2626;">Interview Cancelled</h2>
            <p>Dear {{applicantName}},</p>
            <p>We regret to inform you that your scheduled interview for the <strong>{{trackName}}</strong> track has been cancelled.</p>
            
            <div style="background-color: #fef2f2; padding: 20px; margin: 20px 0; border-radius: 8px; border-left: 4px solid #dc2626;">
              <h3 style="margin-top: 0;">Cancelled Interview Details:</h3>
              <p><strong>Originally Scheduled:</strong> {{interviewDate}} at {{interviewTime}}</p>
              <p><strong>Interviewer:</strong> {{mentorName}}</p>
              <p><strong>Reason:</strong> {{cancellationReason}}</p>
            </div>
            
            <p>{{additionalMessage}}</p>
            
            <p>We apologize for any inconvenience caused. If you have any questions, please contact us at {{supportEmail}}.</p>
            <p>Best regards,<br>The {{platformName}} Team</p>
          </div>
        `,
        templateType: "interview_cancellation_notification",
        variables: ["applicantName", "trackName", "interviewDate", "interviewTime", "mentorName", "cancellationReason", "additionalMessage", "platformName", "supportEmail"],
        createdBy: adminId,
      },
      {
        name: "Interview Reminder Notification",
        subject: "Interview Reminder - Tomorrow at {{interviewTime}}",
        htmlContent: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h2 style="color: #2563eb;">Interview Reminder</h2>
            <p>Dear {{applicantName}},</p>
            <p>This is a friendly reminder about your upcoming interview for the <strong>{{trackName}}</strong> track.</p>
            
            <div style="background-color: #dbeafe; padding: 20px; margin: 20px 0; border-radius: 8px; border-left: 4px solid #2563eb;">
              <h3 style="margin-top: 0;">📅 Interview Details:</h3>
              <p><strong>Date:</strong> {{interviewDate}}</p>
              <p><strong>Time:</strong> {{interviewTime}}</p>
              <p><strong>Interviewer:</strong> {{mentorName}}</p>
              <p><strong>Duration:</strong> Approximately 30-45 minutes</p>
            </div>
            
            <div style="background-color: #f3f4f6; padding: 20px; margin: 20px 0; border-radius: 8px;">
              <h3 style="margin-top: 0;">💡 Preparation Tips:</h3>
              <ul>
                <li>Review your application and portfolio</li>
                <li>Prepare questions about the program</li>
                <li>Test your internet connection and camera</li>
                <li>Have a copy of your CV/resume ready</li>
              </ul>
            </div>
            
            <p>If you need to reschedule or have any technical issues, please contact us immediately at {{supportEmail}}.</p>
            <p>We look forward to speaking with you!</p>
            <p>Best regards,<br>The {{platformName}} Team</p>
          </div>
        `,
        templateType: "interview_reminder_notification",
        variables: ["applicantName", "trackName", "interviewDate", "interviewTime", "mentorName", "platformName", "supportEmail"],
        createdBy: adminId,
      },
    ];
    // Check if templates already exist
    const existingTemplates = await EmailTemplate.find({});
    if (existingTemplates.length > 0) {
      console.log("Email templates already exist, skipping seed...");
      await EmailTemplate.deleteMany({});
    }

    // Insert templates
    await EmailTemplate.insertMany(defaultTemplates);
    console.log(
      `✅ Successfully seeded ${defaultTemplates.length} email templates`,
    );
  } catch (error) {
    console.error("Error seeding email templates:", error);
  }
};
// Function to update existing applications and users with current admin user ID
export const updateTemplateOwnership = async (adminUserId: string) => {
  try {
    await EmailTemplate.updateMany(
      { createdBy: { $exists: false } },
      { createdBy: adminUserId },
    );
    console.log("✅ Updated email template ownership");
  } catch (error) {
    console.error("Error updating template ownership:", error);
  }
};
