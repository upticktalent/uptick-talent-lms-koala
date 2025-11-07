import nodemailer from "nodemailer";

export interface EmailConfig {
  host: string;
  port: number;
  secure: boolean;
  auth: {
    user: string;
    pass: string;
  };
}

export interface EmailOptions {
  to: string;
  subject: string;
  html: string;
  text?: string;
}

class EmailService {
  private transporter: nodemailer.Transporter;

  constructor() {
    this.transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST || "smtp.gmail.com",
      port: parseInt(process.env.SMTP_PORT || "587"),
      secure: process.env.SMTP_SECURE === "true",
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASSWORD,
      },
    });
  }

  async sendEmail(options: EmailOptions): Promise<void> {
    try {
      const mailOptions = {
        from: `"${process.env.APP_NAME || "Uptick Talent"}" <${process.env.SMTP_FROM || process.env.SMTP_USER}>`,
        to: options.to,
        subject: options.subject,
        html: options.html,
        text: options.text,
      };

      await this.transporter.sendMail(mailOptions);
      console.log(`Email sent successfully to ${options.to}`);
    } catch (error) {
      console.error("Error sending email:", error);
      throw new Error("Failed to send email");
    }
  }

  // Application received confirmation
  async sendApplicationConfirmation(
    applicantEmail: string,
    applicantName: string,
    cohortName: string,
  ): Promise<void> {
    const subject = "Application Received - Uptick Talent LMS";
    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #2563eb;">Application Received Successfully!</h2>
        <p>Dear ${applicantName},</p>
        <p>Thank you for applying to join the <strong>${cohortName}</strong> cohort at Uptick Talent.</p>
        <p>Your application has been received and is currently under review. Our team will carefully evaluate your application and get back to you soon.</p>
        <div style="background-color: #f3f4f6; padding: 20px; margin: 20px 0; border-radius: 8px;">
          <h3 style="margin-top: 0;">What happens next?</h3>
          <ul>
            <li>Our mentors will review your application and CV</li>
            <li>You'll receive an email notification with the decision</li>
            <li>If accepted, you'll receive login credentials to access the platform</li>
          </ul>
        </div>
        <p>If you have any questions, please don't hesitate to contact us.</p>
        <p>Best regards,<br>The Uptick Talent Team</p>
      </div>
    `;

    await this.sendEmail({
      to: applicantEmail,
      subject,
      html,
    });
  }

  // Application acceptance with credentials
  async sendAcceptanceEmail(
    applicantEmail: string,
    applicantName: string,
    cohortName: string,
    password: string,
  ): Promise<void> {
    const loginUrl = process.env.FRONTEND_URL || "http://localhost:3000";
    const subject =
      "🎉 Congratulations! You've been accepted - Uptick Talent LMS";
    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #16a34a;">🎉 Congratulations! You've been accepted!</h2>
        <p>Dear ${applicantName},</p>
        <p>We're excited to inform you that you have been <strong>accepted</strong> into the <strong>${cohortName}</strong> cohort at Uptick Talent!</p>
        
        <div style="background-color: #dcfce7; padding: 20px; margin: 20px 0; border-radius: 8px; border-left: 4px solid #16a34a;">
          <h3 style="margin-top: 0; color: #15803d;">Your Login Credentials</h3>
          <p><strong>Email:</strong> ${applicantEmail}</p>
          <p><strong>Temporary Password:</strong> <code style="background-color: #fff; padding: 4px 8px; border-radius: 4px; font-family: monospace;">${password}</code></p>
          <p><strong>Login URL:</strong> <a href="${loginUrl}/login" style="color: #2563eb;">${loginUrl}/login</a></p>
        </div>

        <div style="background-color: #fef3c7; padding: 20px; margin: 20px 0; border-radius: 8px; border-left: 4px solid #f59e0b;">
          <h3 style="margin-top: 0; color: #d97706;">Important Security Notice</h3>
          <p>⚠️ This is a temporary password. For your security, you'll be required to change it upon your first login.</p>
        </div>

        <div style="background-color: #f3f4f6; padding: 20px; margin: 20px 0; border-radius: 8px;">
          <h3 style="margin-top: 0;">Next Steps:</h3>
          <ol>
            <li>Click the login link above or visit our platform</li>
            <li>Enter your email and temporary password</li>
            <li>Create a new secure password</li>
            <li>Complete your profile setup</li>
            <li>Start your learning journey!</li>
          </ol>
        </div>

        <p>Welcome to the Uptick Talent community! We're thrilled to have you on board and look forward to supporting your growth and success.</p>
        
        <p>If you have any questions or need assistance, please don't hesitate to reach out to our support team.</p>
        
        <p>Best regards,<br>The Uptick Talent Team</p>
      </div>
    `;

    await this.sendEmail({
      to: applicantEmail,
      subject,
      html,
    });
  }

  // Application rejection
  async sendRejectionEmail(
    applicantEmail: string,
    applicantName: string,
    cohortName: string,
    reason?: string,
  ): Promise<void> {
    const subject = "Application Update - Uptick Talent LMS";
    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #dc2626;">Application Update</h2>
        <p>Dear ${applicantName},</p>
        <p>Thank you for your interest in joining the <strong>${cohortName}</strong> cohort at Uptick Talent.</p>
        <p>After careful consideration, we regret to inform you that your application was not selected for this cohort.</p>
        ${
          reason
            ? `
        <div style="background-color: #fef2f2; padding: 20px; margin: 20px 0; border-radius: 8px; border-left: 4px solid #dc2626;">
          <h3 style="margin-top: 0; color: #dc2626;">Feedback</h3>
          <p>${reason}</p>
        </div>
        `
            : ""
        }
        <div style="background-color: #f0f9ff; padding: 20px; margin: 20px 0; border-radius: 8px; border-left: 4px solid #2563eb;">
          <h3 style="margin-top: 0; color: #1d4ed8;">Don't Give Up!</h3>
          <p>We encourage you to apply for future cohorts. Keep developing your skills and consider the feedback provided.</p>
          <p>Follow us on our social media channels to stay updated on new cohort announcements.</p>
        </div>
        <p>Thank you again for your interest in Uptick Talent. We wish you all the best in your career journey.</p>
        <p>Best regards,<br>The Uptick Talent Team</p>
      </div>
    `;

    await this.sendEmail({
      to: applicantEmail,
      subject,
      html,
    });
  }

  // Welcome email for new mentors/admins
  async sendWelcomeEmail(
    userEmail: string,
    userName: string,
    role: string,
    password: string,
    assignedTracks?: string,
  ): Promise<void> {
    const loginUrl = process.env.FRONTEND_URL || "http://localhost:3000";
    const subject = `Welcome to Uptick Talent - ${role.charAt(0).toUpperCase() + role.slice(1)} Account Created`;

    const trackSection = assignedTracks
      ? `
      <div style="background-color: #f0f9ff; padding: 20px; margin: 20px 0; border-radius: 8px; border-left: 4px solid #2563eb;">
        <h3 style="margin-top: 0; color: #1d4ed8;">Your Assigned Tracks</h3>
        <p><strong>Tracks:</strong> ${assignedTracks}</p>
        <p>You can review applications and manage students for these tracks.</p>
      </div>
    `
      : "";

    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #16a34a;">🎉 Welcome to Uptick Talent!</h2>
        <p>Dear ${userName},</p>
        <p>Your <strong>${role}</strong> account has been created successfully for the Uptick Talent Learning Management System.</p>
        
        <div style="background-color: #dcfce7; padding: 20px; margin: 20px 0; border-radius: 8px; border-left: 4px solid #16a34a;">
          <h3 style="margin-top: 0; color: #15803d;">Your Login Credentials</h3>
          <p><strong>Email:</strong> ${userEmail}</p>
          <p><strong>Temporary Password:</strong> <code style="background-color: #fff; padding: 4px 8px; border-radius: 4px; font-family: monospace;">${password}</code></p>
          <p><strong>Login URL:</strong> <a href="${loginUrl}/login" style="color: #2563eb;">${loginUrl}/login</a></p>
        </div>

        ${trackSection}

        <div style="background-color: #fef3c7; padding: 20px; margin: 20px 0; border-radius: 8px; border-left: 4px solid #f59e0b;">
          <h3 style="margin-top: 0; color: #d97706;">Important Security Notice</h3>
          <p>⚠️ This is a temporary password. For your security, you'll be required to change it upon your first login.</p>
        </div>

        <div style="background-color: #f3f4f6; padding: 20px; margin: 20px 0; border-radius: 8px;">
          <h3 style="margin-top: 0;">As a ${role}, you can:</h3>
          <ul>
            ${
              role === "admin"
                ? `
              <li>Create and manage cohorts</li>
              <li>Create mentors and assign tracks</li>
              <li>Review all applications</li>
              <li>Manage system settings</li>
            `
                : `
              <li>Review applications for your assigned tracks</li>
              <li>Accept or reject applications</li>
              <li>Manage students in your tracks</li>
              <li>Provide feedback to applicants</li>
            `
            }
          </ul>
        </div>

        <p>If you have any questions or need assistance, please don't hesitate to reach out to our support team.</p>
        
        <p>Best regards,<br>The Uptick Talent Team</p>
      </div>
    `;

    await this.sendEmail({
      to: userEmail,
      subject,
      html,
    });
  }

  // Assessment email for shortlisted applicants
  async sendAssessmentEmail(
    applicantEmail: string,
    applicantName: string,
    cohortName: string,
    assessmentLink: string,
    applicationId: string,
  ): Promise<void> {
    const subject = `Assessment Required - ${cohortName} Application`;

    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #2c3e50;">Congratulations! You've Been Shortlisted</h2>
        
        <p>Dear ${applicantName},</p>
        
        <p>Great news! Your application for the <strong>${cohortName}</strong> program has been reviewed and you've been <strong>shortlisted</strong> for the next stage.</p>
        
        <p>To proceed with your application, you are required to complete an assessment. This assessment will help us better understand your skills and determine your final acceptance into the program.</p>
        <p>Here is your application ID: <strong><code>${applicationId}</code></strong> it will be required when submitting your assessment.</p>

        <div style="background-color: #f8f9fa; padding: 20px; border-radius: 5px; margin: 20px 0;">
          <h3 style="color: #2c3e50; margin-top: 0;">Assessment Details:</h3>
          <p><strong>Program:</strong> ${cohortName}</p>
          <p><strong>Status:</strong> Shortlisted</p>
          <p><strong>Next Step:</strong> Complete Assessment</p>
        </div>
        
        <div style="text-align: center; margin: 30px 0;">
          <a href="${assessmentLink}" 
             style="background-color: #3498db; color: white; padding: 12px 30px; 
                    text-decoration: none; border-radius: 5px; display: inline-block;
                    font-weight: bold;">
            Start Assessment
          </a>
        </div>
        
        <div style="background-color: #fff3cd; padding: 15px; border-radius: 5px; margin: 20px 0;">
          <p style="margin: 0;"><strong>Important:</strong></p>
          <ul style="margin: 10px 0;">
            <li>Please complete the assessment within the specified timeframe</li>
            <li>Results will be used for final admission decisions</li>
          </ul>
        </div>
        
        <p>If you have any questions about the assessment or technical issues, please don't hesitate to contact our support team.</p>
        
        <p>Best of luck with your assessment!</p>
        
        <p>Best regards,<br>The Uptick Talent Team</p>
      </div>
    `;

    await this.sendEmail({
      to: applicantEmail,
      subject,
      html,
    });
  }

  // Assessment submission confirmation email
  async sendAssessmentConfirmation(
    applicantEmail: string,
    applicantName: string,
    trackName: string,
    submissionType: string,
  ): Promise<void> {
    const subject = `Assessment Submitted Successfully - ${trackName}`;

    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #27ae60;">Assessment Submitted Successfully!</h2>
        
        <p>Dear ${applicantName},</p>
        
        <p>Thank you for submitting your assessment for the <strong>${trackName}</strong> program. We have successfully received your submission.</p>
        
        <div style="background-color: #f8f9fa; padding: 20px; border-radius: 5px; margin: 20px 0;">
          <h3 style="color: #2c3e50; margin-top: 0;">Submission Details:</h3>
          <p><strong>Program:</strong> ${trackName}</p>
          <p><strong>Submission Type:</strong> ${submissionType === "file" ? "File Upload" : "Link Submission"}</p>
          <p><strong>Status:</strong> Submitted</p>
          <p><strong>Submitted At:</strong> ${new Date().toLocaleString()}</p>
        </div>
        
        <div style="background-color: #e8f5e8; padding: 15px; border-radius: 5px; margin: 20px 0;">
          <h4 style="color: #27ae60; margin-top: 0;">What happens next?</h4>
          <ul style="margin: 10px 0;">
            <li>Our team will review your assessment</li>
            <li>You will receive an email notification once the review is complete</li>
            <li>The review process typically takes 3-5 business days</li>
            <li>Final admission decisions will be communicated via email</li>
          </ul>
        </div>
        
        <p>If you have any questions or concerns about your submission, please don't hesitate to contact our support team.</p>
        
        <p>Thank you for your interest in joining our program!</p>
        
        <p>Best regards,<br>The Uptick Talent Team</p>
      </div>
    `;

    await this.sendEmail({
      to: applicantEmail,
      subject,
      html,
    });
  }

  // Assessment review notification email
  async sendAssessmentReviewNotification(
    applicantEmail: string,
    applicantName: string,
    trackName: string,
    status: string,
    score?: number,
  ): Promise<void> {
    const subject = `Assessment Review Complete - ${trackName}`;
    const statusColor = status === "reviewed" ? "#27ae60" : "#3498db";

    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: ${statusColor};">Assessment Review Complete</h2>
        
        <p>Dear ${applicantName},</p>
        
        <p>We have completed the review of your assessment for the <strong>${trackName}</strong> program.</p>
        
        <div style="background-color: #f8f9fa; padding: 20px; border-radius: 5px; margin: 20px 0;">
          <h3 style="color: #2c3e50; margin-top: 0;">Review Results:</h3>
          <p><strong>Program:</strong> ${trackName}</p>
          <p><strong>Status:</strong> <span style="color: ${statusColor}; font-weight: bold;">${status.charAt(0).toUpperCase() + status.slice(1)}</span></p>
          ${score !== undefined ? `<p><strong>Score:</strong> ${score}/100</p>` : ""}
          <p><strong>Reviewed At:</strong> ${new Date().toLocaleString()}</p>
        </div>
        
        ${
          status === "reviewed"
            ? `
          <div style="background-color: #e8f5e8; padding: 15px; border-radius: 5px; margin: 20px 0;">
            <p style="margin: 0;"><strong>Next Steps:</strong></p>
            <p style="margin: 10px 0;">Our admissions team will now make the final decision on your application. You will receive a notification about the final outcome within the next few days.</p>
          </div>
        `
            : ""
        }
        
        <p>Thank you for your patience during the review process.</p>
        
        <p>Best regards,<br>The Uptick Talent Team</p>
      </div>
    `;

    await this.sendEmail({
      to: applicantEmail,
      subject,
      html,
    });
  }
}

export const emailService = new EmailService();
