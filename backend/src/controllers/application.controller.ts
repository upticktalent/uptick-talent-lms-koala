import { Request, Response } from "express";
import { User } from "../models/User.model";
import { Application } from "../models/Application.model";
import { Cohort } from "../models/Cohort.model";
import { Track } from "../models/Track.model";
import { hashPassword, generatePassword } from "../utils/auth";
import {
  uploadCV,
  validateUploadedFile,
  getFileUrl,
} from "../services/upload.service";
import { brevoEmailService } from "../services/brevoEmail.service";
import { AuthRequest } from "../middleware/auth";
import { HttpStatusCode } from "../config";
import { asyncHandler, isValidObjectId } from "../utils/mongooseErrorHandler";
import { getCurrentActiveCohort } from "./cohort.controller";

export const submitApplication = asyncHandler(
  async (req: Request, res: Response) => {
    try {
      const {
        firstName,
        lastName,
        email,
        phoneNumber,
        gender,
        country,
        state,
        educationalQualification,
        tools,
        trackId,
        cohortNumber,
        referralSource,
        motivation,
      } = req.body;

      const cvFile = req.file;
      // Validate uploaded file first
      if (!cvFile) {
        return res.status(400).json({
          success: false,
          message: "CV file is required. Please upload a PDF or DOCX file.",
        });
      }

      try {
        validateUploadedFile(cvFile);
      } catch (fileError) {
        console.error("File validation error:", fileError);
        return res.status(400).json({
          success: false,
          message:
            fileError instanceof Error
              ? fileError.message
              : "Invalid file upload",
        });
      }

      // Verify cohort and track exist
      const selectedCohort = await Cohort.findOne({
        cohortNumber,
      });
      if (!selectedCohort) {
        return res.status(400).json({
          success: false,
          message: "Selected cohort not found",
        });
      }

      const selectedTrack = await Track.findOne({ trackId });
      if (!selectedTrack) {
        return res.status(400).json({
          success: false,
          message: "Selected track not found",
        });
      }

      const activeCohort = await Cohort.findOne({
        status: "active",
      }).populate("tracks", "name description");

      // Check if user already exists with this email
      let user = await User.findOne({ email: email.toLowerCase() });

      if (user) {
        // Check if user already has an application for this cohort
        const existingApplication = await Application.findOne({
          applicant: user._id,
          cohort: activeCohort?._id || selectedCohort._id,
        });

        if (existingApplication) {
          return res.status(HttpStatusCode.BAD_REQUEST).json({
            success: false,
            message: "You have already applied for this cohort",
          });
        }
      } else {
        // Create new user account
        const tempPassword = generatePassword();
        const hashedPassword = await hashPassword(tempPassword);

        user = new User({
          firstName: firstName.trim(),
          lastName: lastName.trim(),
          email: email.toLowerCase().trim(),
          phoneNumber: phoneNumber.trim(),
          gender,
          country: country.trim(),
          state: state.trim(),
          password: hashedPassword,
          role: "applicant",
          isPasswordDefault: true,
        });

        await user.save();
      }

      if (!selectedCohort.isAcceptingApplications) {
        return res.status(400).json({
          success: false,
          message: "This cohort is not currently accepting applications",
        });
      }

      // Extract CV URL safely from Cloudinary upload
      let cvUrl: string;
      try {
        // Cloudinary URL can be in path or secure_url properties
        const fileAny = cvFile as any;
        cvUrl = getFileUrl(fileAny.path || fileAny.secure_url || fileAny.url);
      } catch (urlError) {
        console.error("Error extracting CV URL:", urlError);
        return res.status(500).json({
          success: false,
          message: "Failed to process uploaded CV. Please try again.",
        });
      }

      const application = new Application({
        applicant: user._id,
        cohort: selectedCohort._id,
        track: selectedTrack._id,
        educationalQualification: educationalQualification?.trim(),
        tools: Array.isArray(tools)
          ? tools.map((tool: string) => tool.trim()).filter(Boolean)
          : [],
        cvUrl,
        status: "pending",
        referralSource: referralSource?.trim(),
        motivation: motivation?.trim(),
      });

      await application.save();

      // Send confirmation email
      await brevoEmailService.sendApplicationConfirmation(
        user.email,
        `${user.firstName} ${user.lastName}`,
        selectedTrack.name,
        application._id.toString(),
      );

      res.status(201).json({
        success: true,
        message:
          "Application submitted successfully! You will receive an email confirmation shortly.",
        data: {
          applicationId: application._id,
          status: application.status,
          submittedAt: application.submittedAt,
        },
      });
    } catch (error) {
      console.error("Application submission error:", error);
      return res.status(500).json({
        success: false,
        message:
          "An error occurred while processing your application. Please try again.",
      });
    }
  },
);

export const getApplications = asyncHandler(
  async (req: AuthRequest, res: Response) => {
    const { status, cohort, track, page = 1, limit = 10 } = req.query;

    // Build filter query
    const filter: any = {};

    if (status) {
      filter.status = status;
    }

    if (cohort) {
      filter.cohort = cohort;
    }

    if (track) {
      filter.track = track;
    }

    const skip = (Number(page) - 1) * Number(limit);

    const applications = await Application.find(filter)
      .populate("applicant", "firstName lastName email")
      .populate("cohort", "name")
      .populate("track", "name")
      .populate("reviewedBy", "firstName lastName")
      .sort({ submittedAt: -1 })
      .skip(skip)
      .limit(Number(limit));

    const total = await Application.countDocuments(filter);

    res.status(200).json({
      success: true,
      message: "Applications retrieved successfully",
      data: {
        applications,
        pagination: {
          total,
          page: Number(page),
          limit: Number(limit),
          pages: Math.ceil(total / Number(limit)),
        },
      },
    });
  },
);

export const reviewApplication = asyncHandler(
  async (req: AuthRequest, res: Response) => {
    const { id } = req.params;
    const { status, reviewNotes, rejectionReason } = req.body;
    const reviewerId = req.user._id;

    // Validate ObjectId format
    if (!isValidObjectId(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid application ID",
      });
    }

    const application = await Application.findById(id)
      .populate("applicant")
      .populate("cohort");

    if (!application) {
      return res.status(404).json({
        success: false,
        message: "Application not found",
      });
    }

    // Update application
    application.status = status;
    application.reviewedBy = reviewerId;
    application.reviewedAt = new Date();

    if (reviewNotes) {
      application.reviewNotes = reviewNotes;
    }

    if (rejectionReason) {
      application.rejectionReason = rejectionReason;
    }

    await application.save();

    // Handle status-specific actions and emails
    const applicant = application.applicant as any;
    const cohort = application.cohort as any;

    if (status === "shortlisted") {
      // Generate assessment link
      const assessmentLink = `${process.env.FRONTEND_URL || "http://localhost:3000"}/assessment/${application._id}`;

      // Send assessment email
      await brevoEmailService.sendAssessmentEmail(
        applicant.email,
        `${applicant.firstName} ${applicant.lastName}`,
        cohort.name,
        assessmentLink,
        application._id,
      );
    } else if (status === "accepted") {
      // Generate password and update user role
      const tempPassword = generatePassword();
      const hashedPassword = await hashPassword(tempPassword);

      const user = await User.findById(applicant._id);
      if (user) {
        user.password = hashedPassword;
        user.role = "student";
        user.isPasswordDefault = true;
        await user.save();

        // Send acceptance email with credentials
        await brevoEmailService.sendAcceptanceEmail(
          applicant.email,
          `${applicant.firstName} ${applicant.lastName}`,
          cohort.name,
          tempPassword,
        );

        // Update cohort student count
        const cohortDoc = await Cohort.findById(cohort._id);
        if (cohortDoc) {
          cohortDoc.currentStudents += 1;
          await cohortDoc.save();
        }
      }
    } else if (status === "rejected") {
      // Send rejection email
      await brevoEmailService.sendRejectionEmail(
        applicant.email,
        `${applicant.firstName} ${applicant.lastName}`,
        cohort.name,
        rejectionReason,
      );
    }

    res.status(200).json({
      success: true,
      message: `Application ${status} successfully`,
      data: application,
    });
  },
);
export const getApplicationDetails = asyncHandler(
  async (req: Request, res: Response) => {
    const { id } = req.params;

    // Validate ObjectId format
    if (!isValidObjectId(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid application ID",
      });
    }

    const application = await Application.findById(id)
      .populate(
        "applicant",
        "firstName lastName email phoneNumber gender country state",
      )
      .populate("cohort", "name description startDate endDate")
      .populate("track", "name description")
      .populate("reviewedBy", "firstName lastName");

    if (!application) {
      return res.status(404).json({
        success: false,
        message: "Application not found",
      });
    }

    res.status(200).json({
      success: true,
      message: "Application details retrieved successfully",
      data: application,
    });
  },
);
