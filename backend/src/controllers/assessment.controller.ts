import { Request, Response } from "express";
import { Assessment } from "../models/Assessment.model";
import { Application } from "../models/Application.model";
import { Track } from "../models/Track.model";
import { User } from "../models/User.model";
import { asyncHandler } from "../utils/mongooseErrorHandler";
import { isValidObjectId } from "../utils/mongooseErrorHandler";
import { getAssessmentFileUrl } from "../services/upload.service";
import { brevoEmailService } from "../services/brevoEmail.service";
import { AuthRequest } from "../middleware/auth";

// Check if application ID exists and is eligible for assessment
export const checkApplicationEligibility = asyncHandler(
  async (req: Request, res: Response) => {
    const { applicationId } = req.params;

    // Validate Application ID format
    if (!isValidObjectId(applicationId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid application ID format",
      });
    }

    // Fetch the application
    const application = await Application.findById(applicationId)
      .populate("track", "name")
      .populate("applicant", "firstName lastName email")
      .select("status track applicant");

    if (!application) {
      return res.status(404).json({
        success: false,
        message: "Application not found with the provided ID",
        eligible: false,
      });
    }

    // Check if application is shortlisted
    const isEligible = application.status === "shortlisted";

    // Check if assessment already exists for this application
    const existingAssessment = await Assessment.findOne({
      application: applicationId,
    });

    const hasExistingAssessment = !!existingAssessment;

    res.status(200).json({
      success: true,
      message: "Application eligibility checked successfully",
      data: {
        applicationId,
        applicant: {
          name: `${(application.applicant as any).firstName} ${(application.applicant as any).lastName}`,
          email: (application.applicant as any).email,
        },
        track: {
          name: (application.track as any).name,
        },
        status: application.status,
        eligible: isEligible && !hasExistingAssessment,
        reasons: {
          notShortlisted: application.status !== "shortlisted",
          alreadySubmitted: hasExistingAssessment,
        },
      },
    });
  },
);

// Submit assessment (for applicants)
export const submitAssessment = asyncHandler(
  async (req: Request, res: Response) => {
    const { applicationId, linkUrl, notes } = req.body;

    // Validate required fields - Application ID is mandatory
    if (!applicationId) {
      return res.status(400).json({
        success: false,
        message: "Application ID is required",
      });
    }

    // Validate Application ID format
    if (!isValidObjectId(applicationId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid application ID format",
      });
    }

    // Validate notes length if provided
    if (notes && notes.length > 1000) {
      return res.status(400).json({
        success: false,
        message: "Notes cannot exceed 1000 characters",
      });
    }

    // Check what type of submission this is
    const hasFile = !!req.file;
    const hasUrl = !!linkUrl;

    if (!hasFile && !hasUrl) {
      return res.status(400).json({
        success: false,
        message: "Either a file upload or a link URL must be provided",
      });
    }

    // Fetch and validate the application
    const application = await Application.findById(applicationId)
      .populate("track")
      .populate("applicant");

    if (!application) {
      return res.status(404).json({
        success: false,
        message: "Application not found with the provided ID",
      });
    }

    // Check if application is shortlisted
    if (application.status !== "shortlisted") {
      return res.status(400).json({
        success: false,
        message:
          "Assessment can only be submitted for shortlisted applications",
      });
    }

    // Check if assessment already exists for this application
    const existingAssessment = await Assessment.findOne({
      application: applicationId,
    });
    if (existingAssessment) {
      return res.status(409).json({
        success: false,
        message: "Assessment has already been submitted for this application",
      });
    }

    // Process submission content
    let fileUrl = null;
    let file_url = false;
    if (hasFile && hasUrl) {
      file_url = true;
      fileUrl = getAssessmentFileUrl((req.file as any).path);
      try {
        new URL(linkUrl);
      } catch {
        return res.status(400).json({
          success: false,
          message: "Please provide a valid URL",
        });
      }
    } else if (hasFile) {
      fileUrl = getAssessmentFileUrl((req.file as any).path); // Cloudinary URL is in the path property
    } else if (hasUrl) {
      // Validate URL format
      try {
        new URL(linkUrl);
      } catch {
        return res.status(400).json({
          success: false,
          message: "Please provide a valid URL",
        });
      }
    }

    // Create assessment with simplified data
    const assessmentData = {
      application: application._id,
      ...(fileUrl && { fileUrl }),
      ...(linkUrl && { linkUrl }),
      ...(notes && { notes: notes.trim() }),
    };

    const assessment = await Assessment.create(assessmentData);

    // Populate the created assessment with application details
    await assessment.populate([
      {
        path: "application",
        populate: [
          { path: "applicant", select: "firstName lastName email" },
          { path: "track", select: "name" },
        ],
      },
    ]);

    // Send confirmation email to applicant
    try {
      const applicant = (assessment.application as any).applicant;
      const trackName = (assessment.application as any).track.name;
      const submissionType = assessment.fileUrl ? "file" : "link";
      await brevoEmailService.sendAssessmentConfirmation(
        applicant.email,
        `${applicant.firstName} ${applicant.lastName}`,
        trackName,
        submissionType,
      );
    } catch (emailError) {
      console.error("Error sending assessment confirmation email:", emailError);
      // Don't fail the assessment submission if email fails
    }

    res.status(201).json({
      success: true,
      message: "Assessment submitted successfully",
      data: {
        assessment: {
          _id: assessment._id,
          applicationId: assessment.application,
          submissionType: file_url
            ? "File and link"
            : assessment.fileUrl
              ? "file"
              : "link", // Computed for response
          status: assessment.status,
          submittedAt: assessment.submittedAt,
          ...(assessment.fileUrl && { fileUrl: assessment.fileUrl }),
          ...(assessment.linkUrl && { linkUrl: assessment.linkUrl }),
          ...(assessment.notes && { notes: assessment.notes }),
        },
      },
    });
  },
);

// Get assessments (for admin/mentors)
export const getAssessments = asyncHandler(
  async (req: AuthRequest, res: Response) => {
    const { status, page = 1, limit = 10 } = req.query;

    // Build filter query
    const filter: any = {};

    if (status) {
      filter.status = status;
    }

    const skip = (Number(page) - 1) * Number(limit);

    const assessments = await Assessment.find(filter)
      .populate({
        path: "application",
        populate: [
          { path: "applicant", select: "firstName lastName email" },
          { path: "track", select: "name" },
          { path: "cohort", select: "name" },
        ],
      })
      .populate("reviewedBy", "firstName lastName")
      .sort({ submittedAt: -1 })
      .skip(skip)
      .limit(Number(limit));

    const total = await Assessment.countDocuments(filter);

    // Add computed submissionType to response
    const assessmentsWithType = assessments.map((assessment) => ({
      ...assessment.toObject(),
      submissionType: assessment.fileUrl ? "file" : "link",
    }));

    res.status(200).json({
      success: true,
      message: "Assessments retrieved successfully",
      data: {
        assessments: assessmentsWithType,
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

// Get assessment details
export const getAssessmentDetails = asyncHandler(
  async (req: Request, res: Response) => {
    const { id } = req.params;

    if (!isValidObjectId(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid assessment ID",
      });
    }

    const assessment = await Assessment.findById(id)
      .populate({
        path: "application",
        populate: [
          { path: "applicant", select: "firstName lastName email" },
          { path: "track", select: "name description" },
          { path: "cohort", select: "name startDate endDate" },
        ],
      })
      .populate("reviewedBy", "firstName lastName email");

    if (!assessment) {
      return res.status(404).json({
        success: false,
        message: "Assessment not found",
      });
    }

    // Add computed submissionType to response
    const assessmentWithType = {
      ...assessment.toObject(),
      submissionType: assessment.fileUrl ? "file" : "link",
    };

    res.status(200).json({
      success: true,
      message: "Assessment details retrieved successfully",
      data: assessmentWithType,
    });
  },
);

// Review assessment (for admin/mentors)
export const reviewAssessment = asyncHandler(
  async (req: AuthRequest, res: Response) => {
    const { id } = req.params;
    const { status, reviewNotes, score } = req.body;
    const reviewerId = req.user?.id;

    if (!isValidObjectId(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid assessment ID",
      });
    }

    const assessment = await Assessment.findById(id).populate("application");

    if (!assessment) {
      return res.status(404).json({
        success: false,
        message: "Assessment not found",
      });
    }

    // Update assessment
    if (status) assessment.status = status;
    if (reviewNotes) assessment.reviewNotes = reviewNotes;
    if (score !== undefined) assessment.score = score;
    if (reviewerId) assessment.reviewedBy = reviewerId;
    assessment.reviewedAt = new Date();

    await assessment.save();

    // Send notification email
    await assessment.populate({
      path: "application",
      populate: [
        { path: "applicant", select: "firstName lastName email" },
        { path: "track", select: "name" },
      ],
    });

    const applicant = (assessment.application as any).applicant;
    const trackName = (assessment.application as any).track.name;

    await brevoEmailService.sendAssessmentReviewNotification(
      applicant.email,
      `${applicant.firstName} ${applicant.lastName}`,
      trackName,
      status || assessment.status,
      score,
    );

    res.status(200).json({
      success: true,
      message: "Assessment reviewed successfully",
      data: assessment,
    });
  },
);

// Get assessment by application ID (for applicants to check status)
export const getAssessmentByApplication = asyncHandler(
  async (req: Request, res: Response) => {
    const { applicationId } = req.params;

    if (!isValidObjectId(applicationId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid application ID",
      });
    }

    const assessment = await Assessment.findOne({
      application: applicationId,
    })
      .populate({
        path: "application",
        populate: [
          { path: "applicant", select: "firstName lastName email" },
          { path: "track", select: "name" },
        ],
      })
      .populate("reviewedBy", "firstName lastName")
      .select("-reviewNotes"); // Hide review notes from applicants

    if (!assessment) {
      return res.status(404).json({
        success: false,
        message: "Assessment not found for this application",
      });
    }

    // Add computed submissionType to response
    const assessmentWithType = {
      ...assessment.toObject(),
      submissionType: assessment.fileUrl ? "file" : "link",
    };

    res.status(200).json({
      success: true,
      message: "Assessment status retrieved successfully",
      data: assessmentWithType,
    });
  },
);
