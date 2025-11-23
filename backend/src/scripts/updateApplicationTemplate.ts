import mongoose from "mongoose";
import { EmailTemplate } from "../models/EmailTemplate.model";
import { User } from "../models/User.model";

const updateApplicationConfirmationTemplate = async () => {
  try {
    console.log("🔄 Updating application confirmation email template...");

    // Connect to database
    const mongoUri = process.env.DATABASE_URI || "mongodb://localhost:27017/uptick-lms";
    await mongoose.connect(mongoUri);
    console.log("✅ Connected to database");

    // Find an admin user to assign as creator
    const adminUser = await User.findOne({ role: "admin" });
    if (!adminUser) {
      console.log("❌ No admin user found");
      process.exit(1);
    }

    // Update the application confirmation template
    const updatedTemplate = await EmailTemplate.findOneAndUpdate(
      { templateType: "application_confirmation" },
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
          "applicationId"
        ],
        createdBy: adminUser._id,
        updatedAt: new Date()
      },
      { 
        upsert: true,
        new: true
      }
    );

    console.log("✅ Successfully updated application confirmation template with Application ID");
    console.log(`Template ID: ${updatedTemplate?._id}`);

    await mongoose.disconnect();
    console.log("✅ Database connection closed");
  } catch (error) {
    console.error("❌ Error updating template:", error);
    process.exit(1);
  }
};

// Run the script
updateApplicationConfirmationTemplate();