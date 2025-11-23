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
        educationalBackground,
        tools,
        trackId,
        cohortNumber,
        yearsOfExperience,
        githubLink,
        portfolioLink,
        careerGoals,
        weeklyCommitment,
        referralSource,
        referralSourceOther,

        // Legacy fields for backward compatibility
        educationalQualification,
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

      // Ensure the cohort is the current active one and accepting applications
      if (selectedCohort.status !== "active") {
        return res.status(400).json({
          success: false,
          message:
            "Applications are only accepted for the current active cohort",
        });
      }

      // Check if application deadline has passed
      const now = new Date();
      if (selectedCohort.applicationDeadline <= now) {
        return res.status(400).json({
          success: false,
          message: "Application deadline has passed for this cohort",
        });
      }

      // Check if user already exists with this email
      let user = await User.findOne({ email: email.toLowerCase() });

      if (user) {
        // Check if user already has an application for this cohort
        const existingApplication = await Application.findOne({
          applicant: user._id,
          cohort: selectedCohort._id,
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
        educationalBackground: educationalBackground?.trim(),
        tools: Array.isArray(tools)
          ? tools.map((tool: string) => tool.trim()).filter(Boolean)
          : [],
        cvUrl,
        status: "pending",
        yearsOfExperience: yearsOfExperience?.trim(),
        githubLink: githubLink?.trim(),
        portfolioLink: portfolioLink?.trim(),
        careerGoals: careerGoals?.trim(),
        weeklyCommitment: weeklyCommitment?.trim(),
        referralSource: referralSource?.trim(),
        referralSourceOther: referralSourceOther?.trim(),

        // Legacy fields for backward compatibility
        educationalQualification: educationalQualification?.trim(),
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
        user.currentTrack = application.track._id;
        user.currentCohort = (application.cohort as any).cohortNumber;
        await user.save();

        // Send acceptance email with credentials
        await brevoEmailService.sendAcceptanceEmail(
          applicant.email,
          `${applicant.firstName} ${applicant.lastName}`,
          cohort.name,
          tempPassword,
        );

        // Update cohort track student count (new cohort-centric approach)
        const cohortDoc = await Cohort.findById(cohort._id);
        if (cohortDoc) {
          // Update overall cohort student count
          cohortDoc.currentStudents += 1;

          // Update specific track student count within the cohort
          const trackIndex = cohortDoc.tracks.findIndex(
            (ct: any) =>
              ct.track.toString() === application.track._id.toString(),
          );

          if (trackIndex !== -1) {
            cohortDoc.tracks[trackIndex].currentStudents += 1;
          }

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

export const getAvailableTracks = asyncHandler(
  async (req: Request, res: Response) => {
    // Get current active cohort and its tracks
    const activeCohort = await Cohort.findOne({ 
      isCurrentlyActive: true,
      applicationDeadline: { $gte: new Date() }
    }).populate('tracks');

    if (!activeCohort) {
      return res.status(404).json({
        success: false,
        message: "No active cohort accepting applications",
        data: [],
      });
    }

    res.status(200).json({
      success: true,
      message: "Available tracks retrieved successfully",
      data: activeCohort.tracks || [],
    });
  },
);

export const getApplicationsByCohort = asyncHandler(
  async (req: Request, res: Response) => {
    const { cohortId } = req.params;

    if (!isValidObjectId(cohortId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid cohort ID",
      });
    }

    const applications = await Application.find({ cohort: cohortId })
      .populate("applicant", "firstName lastName email")
      .populate("track", "name")
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      message: "Applications retrieved successfully",
      data: applications,
    });
  },
);

export const getApplicationsByTrack = asyncHandler(
  async (req: Request, res: Response) => {
    const { trackId } = req.params;

    if (!isValidObjectId(trackId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid track ID",
      });
    }

    const applications = await Application.find({ track: trackId })
      .populate("applicant", "firstName lastName email")
      .populate("cohort", "name")
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      message: "Applications retrieved successfully",
      data: applications,
    });
  },
);

export const acceptApplication = asyncHandler(
  async (req: AuthRequest, res: Response) => {
    const { id } = req.params;

    if (!isValidObjectId(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid application ID",
      });
    }

    const application = await Application.findById(id)
      .populate("applicant")
      .populate("cohort")
      .populate("track");

    if (!application) {
      return res.status(404).json({
        success: false,
        message: "Application not found",
      });
    }

    if (application.status === "accepted") {
      return res.status(400).json({
        success: false,
        message: "Application is already accepted",
      });
    }

    // Type assertions for populated fields
    const applicant = application.applicant as any;
    const cohort = application.cohort as any;
    const track = application.track as any;

    // Generate password for new student
    const generatedPassword = generatePassword();
    const hashedPassword = await hashPassword(generatedPassword);

    // Create student user account
    const student = new User({
      firstName: applicant.firstName,
      lastName: applicant.lastName,
      email: applicant.email,
      password: hashedPassword,
      role: "student",
      cohort: cohort._id,
      track: track._id,
      isActive: true,
    });

    await student.save();

    // Update application status
    application.status = "accepted";
    application.reviewedBy = req.user?.userId;
    application.reviewedAt = new Date();
    await application.save();

     res.status(200).json({
      success: true,
      message: "Application accepted and student account created",
      data: {
        application,
        student,
        generatedPassword,
      },
    });
  },
);

export const shortlistApplication = asyncHandler(
  async (req: AuthRequest, res: Response) => {
    const { id } = req.params;

    if (!isValidObjectId(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid application ID",
      });
    }

    const application = await Application.findByIdAndUpdate(
      id,
      {
        status: "shortlisted",
        reviewedBy: req.user?.userId,
        reviewedAt: new Date(),
      },
      { new: true }
    ).populate("applicant", "firstName lastName email");

    if (!application) {
      return res.status(404).json({
        success: false,
        message: "Application not found",
      });
    }

    res.status(200).json({
      success: true,
      message: "Application shortlisted successfully",
      data: application,
    });
  },
);

export const rejectApplication = asyncHandler(
  async (req: AuthRequest, res: Response) => {
    const { id } = req.params;
    const { rejectionReason } = req.body;

    if (!isValidObjectId(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid application ID",
      });
    }

    const application = await Application.findByIdAndUpdate(
      id,
      {
        status: "rejected",
        rejectionReason,
        reviewedBy: req.user?.userId,
        reviewedAt: new Date(),
      },
      { new: true }
    ).populate("applicant", "firstName lastName email");

    if (!application) {
      return res.status(404).json({
        success: false,
        message: "Application not found",
      });
    }

    res.status(200).json({
      success: true,
      message: "Application rejected successfully",
      data: application,
    });
  },
);

export const getApplicationStats = asyncHandler(
  async (req: Request, res: Response) => {
    const { cohortId } = req.query;

    const matchFilter: any = {};
    if (cohortId && isValidObjectId(cohortId as string)) {
      matchFilter.cohort = cohortId;
    }

    const stats = await Application.aggregate([
      { $match: matchFilter },
      {
        $group: {
          _id: "$status",
          count: { $sum: 1 },
        },
      },
    ]);

    const totalApplications = await Application.countDocuments(matchFilter);

    const formattedStats = {
      total: totalApplications,
      pending: 0,
      "under-review": 0,
      shortlisted: 0,
      accepted: 0,
      rejected: 0,
    };

    stats.forEach((stat) => {
      formattedStats[stat._id as keyof typeof formattedStats] = stat.count;
    });

    res.status(200).json({
      success: true,
      message: "Application statistics retrieved successfully",
      data: formattedStats,
    });
  },
);

export const bulkUpdateApplications = asyncHandler(
  async (req: AuthRequest, res: Response) => {
    const { applicationIds, status } = req.body;

    if (!Array.isArray(applicationIds) || applicationIds.length === 0) {
      return res.status(400).json({
        success: false,
        message: "Application IDs are required",
      });
    }

    if (!["under-review", "shortlisted", "accepted", "rejected"].includes(status)) {
      return res.status(400).json({
        success: false,
        message: "Invalid status",
      });
    }

    const result = await Application.updateMany(
      { _id: { $in: applicationIds } },
      {
        status,
        reviewedBy: req.user?.userId,
        reviewedAt: new Date(),
      }
    );

    res.status(200).json({
      success: true,
      message: `${result.modifiedCount} applications updated successfully`,
      data: { modified: result.modifiedCount },
    });
  },
);

export const exportApplications = asyncHandler(
  async (req: Request, res: Response) => {
    const { cohortId } = req.query;

    const matchFilter: any = {};
    if (cohortId && isValidObjectId(cohortId as string)) {
      matchFilter.cohort = cohortId;
    }

    const applications = await Application.find(matchFilter)
      .populate("applicant", "firstName lastName email phoneNumber")
      .populate("cohort", "name")
      .populate("track", "name")
      .sort({ createdAt: -1 });

    // Convert to CSV format
    const csvHeaders = [
      "Name",
      "Email",
      "Phone",
      "Track",
      "Cohort",
      "Status",
      "Applied Date",
    ];

    const csvRows = applications.map((app) => {
      const applicant = app.applicant as any;
      const track = app.track as any;
      const cohort = app.cohort as any;
      return [
        `${applicant.firstName} ${applicant.lastName}`,
        applicant.email,
        applicant.phoneNumber || "",
        track?.name || "",
        cohort?.name || "",
        app.status,
        new Date(app.createdAt).toLocaleDateString(),
      ];
    });

    const csvContent = [csvHeaders, ...csvRows]
      .map((row) => row.map((field) => `"${field}"`).join(","))
      .join("\n");

    res.setHeader("Content-Type", "text/csv");
    res.setHeader("Content-Disposition", "attachment; filename=applications.csv");
    res.status(200).send(csvContent);
  },
);