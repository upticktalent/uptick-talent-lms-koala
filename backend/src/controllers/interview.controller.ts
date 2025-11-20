import { Request, Response } from "express";
import { Interview } from "../models/Interview.model";
import { InterviewSlot } from "../models/InterviewSlot.model";
import { Application } from "../models/Application.model";
import { User } from "../models/User.model";
import { asyncHandler } from "../utils/mongooseErrorHandler";
import { isValidObjectId } from "../utils/mongooseErrorHandler";
import { brevoEmailService } from "../services/brevoEmail.service";
import { AuthRequest } from "../middleware/auth";

// ==================== INTERVIEW SLOTS (Admin/Mentor) ====================

// Create available interview slots
export const createInterviewSlots = asyncHandler(
  async (req: AuthRequest, res: Response) => {
    const interviewerId = req.user?.id;
    const { mode } = req.body;

    if (!mode || !["bulk", "manual"].includes(mode)) {
      return res.status(400).json({
        success: false,
        message: "Invalid mode. Must be 'bulk' or 'manual'",
      });
    }

    // =====================================
    // 1️⃣ MANUAL MODE
    // =====================================
    if (mode === "manual") {
      const { slots = [] } = req.body;

      if (!Array.isArray(slots) || slots.length === 0) {
        return res.status(400).json({
          success: false,
          message: "Slots array is required in manual mode",
        });
      }

      const createdSlots: any[] = [];

      for (const slot of slots) {
        const {
          date,
          startTime,
          endTime,
          duration = 30,
          maxInterviews = 1,
          tracks = [],
          notes,
          meetingLink,
        } = slot;

        if (!date || !startTime || !endTime || !tracks.length) continue;

        const slotDate = new Date(date);

        // Check conflicts
        const conflict = await InterviewSlot.findOne({
          interviewer: interviewerId,
          date: slotDate,
          $or: [
            { startTime: { $lte: startTime }, endTime: { $gt: startTime } },
            { startTime: { $lt: endTime }, endTime: { $gte: endTime } },
            { startTime: { $gte: startTime }, endTime: { $lte: endTime } },
          ],
        });

        if (conflict) continue; // skip this slot

        const newSlot = await InterviewSlot.create({
          interviewer: interviewerId,
          tracks,
          date: slotDate,
          startTime,
          endTime,
          duration,
          maxInterviews,
          notes,
          meetingLink,
        });

        createdSlots.push(newSlot);
      }

      return res.status(201).json({
        success: true,
        message: "Manual interview slots created",
        data: createdSlots,
      });
    }

    // =====================================
    // 2️⃣ BULK MODE
    // =====================================
    if (mode === "bulk") {
      const {
        startDate,
        endDate,
        startTime,
        endTime,
        slotDuration = 30,
        maxInterviews = 1,
        tracks = [],
        notes,
        meetingLink,
      } = req.body;

      if (!startDate || !endDate || !startTime || !endTime || !tracks.length) {
        return res.status(400).json({
          success: false,
          message:
            "Start date, end date, start time, end time, and tracks are required",
        });
      }

      const slotsToCreate = [];
      let currentDate = new Date(startDate);

      while (currentDate <= new Date(endDate)) {
        let cursor = new Date(`1970-01-01T${startTime}`);
        const endCursor = new Date(`1970-01-01T${endTime}`);

        while (cursor < endCursor) {
          const slotStart = cursor.toTimeString().slice(0, 5);
          cursor = new Date(cursor.getTime() + slotDuration * 60000);
          const slotEnd = cursor.toTimeString().slice(0, 5);

          slotsToCreate.push({
            date: new Date(currentDate),
            startTime: slotStart,
            endTime: slotEnd,
          });
        }

        currentDate.setDate(currentDate.getDate() + 1);
      }

      // Create all slots
      const created = await InterviewSlot.insertMany(
        slotsToCreate.map((s) => ({
          interviewer: interviewerId,
          tracks,
          date: s.date,
          startTime: s.startTime,
          endTime: s.endTime,
          duration: slotDuration,
          maxInterviews,
          notes,
          meetingLink,
        })),
      );

      return res.status(201).json({
        success: true,
        message: "Bulk interview slots created",
        data: created,
      });
    }
  },
);

// Get interviewer's slots
export const getInterviewerSlots = asyncHandler(
  async (req: AuthRequest, res: Response) => {
    const { page = 1, limit = 10, date, status } = req.query;
    const interviewerId = req.user?.id;

    const filter: any = { interviewer: interviewerId };

    if (date) {
      const queryDate = new Date(date as string);
      filter.date = {
        $gte: new Date(queryDate.setHours(0, 0, 0, 0)),
        $lt: new Date(queryDate.setHours(23, 59, 59, 999)),
      };
    }

    if (status === "available") {
      filter.isAvailable = true;
    } else if (status === "booked") {
      filter.isAvailable = false;
    }

    const skip = (Number(page) - 1) * Number(limit);

    const slots = await InterviewSlot.find(filter)
      .populate("interviewer", "firstName lastName email")
      .sort({ date: 1, startTime: 1 })
      .skip(skip)
      .limit(Number(limit));

    const total = await InterviewSlot.countDocuments(filter);

    res.status(200).json({
      success: true,
      message: "Interview slots retrieved successfully",
      data: {
        slots,
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

// Get available slots for applicants to choose from (filtered by application track)
export const getAvailableSlots = asyncHandler(
  async (req: Request, res: Response) => {
    const { applicationId, date } = req.query;

    // If applicationId is provided, get the application's track for filtering
    let trackId = null;
    if (applicationId) {
      const application =
        await Application.findById(applicationId).select("track");
      if (!application) {
        return res.status(404).json({
          success: false,
          message: "Application not found",
        });
      }
      trackId = application.track;
    }

    // Build filter for available slots in the future
    const filter: any = {
      isAvailable: true,
      date: { $gte: new Date() }, // Only future dates
    };

    // Filter by track if trackId is available
    if (trackId) {
      filter.tracks = { $in: [trackId] };
    }

    if (date) {
      const queryDate = new Date(date as string);
      filter.date = {
        $gte: new Date(queryDate.setHours(0, 0, 0, 0)),
        $lt: new Date(queryDate.setHours(23, 59, 59, 999)),
      };
    }

    const slots = await InterviewSlot.find(filter)
      .populate("interviewer", "firstName lastName")
      .populate("tracks", "name")
      .sort({ date: 1, startTime: 1 })
      .select("-notes -meetingLink"); // Hide sensitive info from applicants

    // Group slots by date for better frontend handling
    const groupedSlots = slots.reduce((acc: any, slot) => {
      const dateKey = slot.date.toISOString().split("T")[0];
      if (!acc[dateKey]) {
        acc[dateKey] = [];
      }
      acc[dateKey].push({
        _id: slot._id,
        interviewer: slot.interviewer,
        tracks: slot.tracks,
        startTime: slot.startTime,
        endTime: slot.endTime,
        duration: slot.duration,
        location: slot.location,
        availableSpots: slot.maxInterviews - slot.bookedCount,
      });
      return acc;
    }, {});

    res.status(200).json({
      success: true,
      message: "Available interview slots retrieved successfully",
      data: {
        slotsByDate: groupedSlots,
        totalSlots: slots.length,
      },
    });
  },
);

// ==================== INTERVIEW SCHEDULING ====================

// Schedule an interview (applicant selects a slot)
export const scheduleInterview = asyncHandler(
  async (req: Request, res: Response) => {
    const { applicationId, slotId } = req.body;

    // Validation
    if (!applicationId || !slotId) {
      return res.status(400).json({
        success: false,
        message: "Application ID and Slot ID are required",
      });
    }

    if (!isValidObjectId(applicationId) || !isValidObjectId(slotId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid Application ID or Slot ID format",
      });
    }

    // Check if application exists and is eligible for interview
    const application = await Application.findById(applicationId)
      .populate("applicant", "firstName lastName email")
      .populate("track", "name");

    if (!application) {
      return res.status(404).json({
        success: false,
        message: "Application not found",
      });
    }

    if (application.status !== "under-review") {
      return res.status(400).json({
        success: false,
        message: "Only applications under review can schedule interviews",
      });
    }

    // Check if interview already exists for this application
    const existingInterview = await Interview.findOne({
      application: applicationId,
    });

    if (existingInterview) {
      return res.status(409).json({
        success: false,
        message: "Interview already scheduled for this application",
      });
    }

    // Check if slot is available
    const slot = await InterviewSlot.findById(slotId).populate(
      "interviewer",
      "firstName lastName email",
    );

    if (!slot) {
      return res.status(404).json({
        success: false,
        message: "Interview slot not found",
      });
    }

    if (!slot.isAvailable || slot.bookedCount >= slot.maxInterviews) {
      return res.status(400).json({
        success: false,
        message: "This interview slot is no longer available",
      });
    }

    // Create the scheduled date/time
    const scheduledDate = new Date(slot.date);
    const [hours, minutes] = slot.startTime.split(":");
    scheduledDate.setHours(parseInt(hours), parseInt(minutes), 0, 0);

    // Create the interview
    const interview = await Interview.create({
      application: applicationId,
      interviewer: slot.interviewer._id,
      scheduledDate,
      duration: slot.duration,
      meetingLink: slot.meetingLink,
      location: slot.location,
      scheduledBy: application.applicant,
      createdBy: slot.interviewer._id,
    });

    // Update slot booking count
    slot.bookedCount += 1;
    await slot.save();

    // Populate interview data for response
    await interview.populate([
      {
        path: "application",
        populate: [
          { path: "applicant", select: "firstName lastName email" },
          { path: "track", select: "name" },
        ],
      },
      { path: "interviewer", select: "firstName lastName email" },
    ]);

    // Send confirmation emails
    try {
      const applicant = (interview.application as any).applicant;
      const interviewer = interview.interviewer as any;
      const trackName = (interview.application as any).track.name;

      // Email to applicant
      await brevoEmailService.sendInterviewScheduledConfirmation(
        applicant.email,
        `${applicant.firstName} ${applicant.lastName}`,
        trackName,
        scheduledDate,
        interview.location || "Online",
        interview.meetingLink,
        `${interviewer.firstName} ${interviewer.lastName}`,
        interviewer.email,
        applicationId,
      );

      // Email to interviewer
      await brevoEmailService.sendInterviewScheduledNotification(
        interviewer.email,
        `${interviewer.firstName} ${interviewer.lastName}`,
        `${applicant.firstName} ${applicant.lastName}`,
        applicant.email,
        trackName,
        scheduledDate,
        interview.location || "Online",
        interview.meetingLink,
        applicationId,
      );
    } catch (emailError) {
      console.error("Error sending interview confirmation emails:", emailError);
      // Don't fail the scheduling if email fails
    }

    res.status(201).json({
      success: true,
      message: "Interview scheduled successfully",
      data: interview,
    });
  },
);

// Get interview details
export const getInterviewDetails = asyncHandler(
  async (req: Request, res: Response) => {
    const { id } = req.params;

    if (!isValidObjectId(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid interview ID",
      });
    }

    const interview = await Interview.findById(id)
      .populate({
        path: "application",
        populate: [
          { path: "applicant", select: "firstName lastName email" },
          { path: "track", select: "name description" },
          { path: "cohort", select: "name startDate endDate" },
        ],
      })
      .populate("interviewer", "firstName lastName email")
      .populate("scheduledBy", "firstName lastName email")
      .populate("createdBy", "firstName lastName email");

    if (!interview) {
      return res.status(404).json({
        success: false,
        message: "Interview not found",
      });
    }

    res.status(200).json({
      success: true,
      message: "Interview details retrieved successfully",
      data: interview,
    });
  },
);

// Get interviews (for admin/mentors)
export const getInterviews = asyncHandler(
  async (req: AuthRequest, res: Response) => {
    const { status, page = 1, limit = 10, track, interviewer } = req.query;
    const userRole = req.user?.role;
    const userId = req.user?.id;

    // Build filter query
    const filter: any = {};

    if (status) {
      filter.status = status;
    }

    // If user is a mentor, only show their interviews
    if (userRole === "mentor" || interviewer) {
      filter.interviewer = interviewer || userId;
    }

    const skip = (Number(page) - 1) * Number(limit);

    // First get interviews, then filter by track if needed
    let interviews = await Interview.find(filter)
      .populate({
        path: "application",
        populate: [
          { path: "applicant", select: "firstName lastName email" },
          { path: "track", select: "name" },
        ],
      })
      .populate("interviewer", "firstName lastName email")
      .sort({ scheduledDate: -1 });

    // Filter by track if specified
    if (track) {
      interviews = interviews.filter(
        (interview: any) =>
          interview.application?.track?._id.toString() === track,
      );
    }

    // Apply pagination after filtering
    const total = interviews.length;
    interviews = interviews.slice(skip, skip + Number(limit));

    res.status(200).json({
      success: true,
      message: "Interviews retrieved successfully",
      data: {
        interviews,
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

// Update interview details (reschedule, change location, etc.)
export const updateInterview = asyncHandler(
  async (req: AuthRequest, res: Response) => {
    const { id } = req.params;
    const {
      scheduledDate,
      duration,
      location,
      meetingLink,
      notes,
      interviewType,
      status,
    } = req.body;

    if (!isValidObjectId(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid interview ID",
      });
    }

    const interview = await Interview.findById(id)
      .populate({
        path: "application",
        populate: [
          { path: "applicant", select: "firstName lastName email" },
          { path: "track", select: "name" },
        ],
      })
      .populate("interviewer", "firstName lastName email");

    if (!interview) {
      return res.status(404).json({
        success: false,
        message: "Interview not found",
      });
    }

    // Only allow updates for scheduled interviews
    if (interview.status !== "scheduled") {
      return res.status(400).json({
        success: false,
        message: "Only scheduled interviews can be updated",
      });
    }

    // Validate scheduled date if provided
    if (scheduledDate) {
      const newDate = new Date(scheduledDate);
      if (newDate < new Date()) {
        return res.status(400).json({
          success: false,
          message: "Interview date must be in the future",
        });
      }
    }

    // Validate status if provided
    if (status && !["scheduled", "interviewed", "cancelled"].includes(status)) {
      return res.status(400).json({
        success: false,
        message:
          "Invalid status. Must be 'scheduled', 'interviewed', or 'cancelled'",
      });
    }

    // Store original date for email comparison
    const originalDate = interview.scheduledDate;
    const isDateChanged =
      scheduledDate &&
      new Date(scheduledDate).getTime() !== originalDate.getTime();

    // Update interview fields
    const updateData: any = {};
    if (scheduledDate) updateData.scheduledDate = new Date(scheduledDate);
    if (duration) updateData.duration = duration;
    if (location) updateData.location = location;
    if (meetingLink !== undefined) updateData.meetingLink = meetingLink;
    if (notes) updateData.notes = notes;
    if (interviewType) updateData.interviewType = interviewType;
    if (status) updateData.status = status;

    const updatedInterview = await Interview.findByIdAndUpdate(
      id,
      { ...updateData, updatedAt: new Date() },
      { new: true, runValidators: true },
    ).populate([
      {
        path: "application",
        populate: [
          { path: "applicant", select: "firstName lastName email" },
          { path: "track", select: "name" },
        ],
      },
      { path: "interviewer", select: "firstName lastName email" },
    ]);

    if (!updatedInterview) {
      return res.status(404).json({
        success: false,
        message: "Interview not found after update",
      });
    }

    // Send update notification emails if date changed
    if (isDateChanged) {
      try {
        const applicant = (updatedInterview.application as any).applicant;
        const interviewer = updatedInterview.interviewer as any;
        const trackName = (updatedInterview.application as any).track.name;

        // Email to applicant about reschedule - using scheduled notification with new date
        await brevoEmailService.sendInterviewScheduledConfirmation(
          applicant.email,
          `${applicant.firstName} ${applicant.lastName}`,
          trackName,
          updatedInterview.scheduledDate,
          updatedInterview.location || "Online",
          updatedInterview.meetingLink,
          `${interviewer.firstName} ${interviewer.lastName}`,
          interviewer.email,
          updatedInterview.application._id.toString(),
        );

        // Email to interviewer about reschedule
        await brevoEmailService.sendInterviewScheduledNotification(
          interviewer.email,
          `${interviewer.firstName} ${interviewer.lastName}`,
          `${applicant.firstName} ${applicant.lastName}`,
          applicant.email,
          trackName,
          updatedInterview.scheduledDate,
          updatedInterview.location || "Online",
          updatedInterview.meetingLink,
          updatedInterview.application._id.toString(),
        );
      } catch (emailError) {
        console.error("Error sending interview update emails:", emailError);
        // Don't fail the update if email fails
      }
    }

    res.status(200).json({
      success: true,
      message: "Interview updated successfully",
      data: updatedInterview,
    });
  },
);

// ==================== INTERVIEW REVIEW ====================

// Review interview and update application status
export const reviewInterview = asyncHandler(
  async (req: AuthRequest, res: Response) => {
    const { id } = req.params;
    const { status, notes, rating, feedback } = req.body;
    const reviewerId = req.user?.id;

    if (!isValidObjectId(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid interview ID",
      });
    }

    // Validate status
    if (status && !["accepted", "rejected"].includes(status)) {
      return res.status(400).json({
        success: false,
        message: "Status must be either 'accepted' or 'rejected'",
      });
    }

    const interview = await Interview.findById(id).populate({
      path: "application",
      populate: [
        { path: "applicant", select: "firstName lastName email" },
        { path: "track", select: "name" },
      ],
    });

    if (!interview) {
      return res.status(404).json({
        success: false,
        message: "Interview not found",
      });
    }

    // Update interview
    interview.status = "interviewed";
    if (notes) interview.notes = notes;
    if (rating) interview.rating = rating;
    if (feedback) interview.feedback = feedback;

    await interview.save();

    // Update application status with decision
    if (status) {
      await Application.findByIdAndUpdate(
        interview.application._id,
        { status: status },
        { new: true },
      );

      // If accepted, promote applicant to student role
      if (status === "accepted") {
        await User.findByIdAndUpdate(
          (interview.application as any).applicant._id,
          { role: "student" },
          { new: true },
        );
      }
    }

    // Send notification email to applicant
    try {
      const applicant = (interview.application as any).applicant;
      const trackName = (interview.application as any).track.name;

      await brevoEmailService.sendInterviewResultNotification(
        applicant.email,
        `${applicant.firstName} ${applicant.lastName}`,
        trackName,
        status || "reviewed",
        feedback,
      );
    } catch (emailError) {
      console.error("Error sending interview result email:", emailError);
    }

    res.status(200).json({
      success: true,
      message: "Interview reviewed successfully",
      data: {
        interview,
        applicationStatus: status,
        applicantName: `${(interview.application as any).applicant.firstName} ${(interview.application as any).applicant.lastName}`,
        trackName: (interview.application as any).track.name,
      },
    });
  },
);

// Get interview by application ID (for applicants to check their interview)
export const getInterviewByApplication = asyncHandler(
  async (req: Request, res: Response) => {
    const { applicationId } = req.params;

    if (!isValidObjectId(applicationId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid application ID",
      });
    }

    const interview = await Interview.findOne({
      application: applicationId,
    })
      .populate({
        path: "application",
        populate: [
          { path: "applicant", select: "firstName lastName email" },
          { path: "track", select: "name" },
        ],
      })
      .populate("interviewer", "firstName lastName")
      .select("-notes -feedback"); // Hide sensitive info from applicants

    if (!interview) {
      return res.status(404).json({
        success: false,
        message: "No interview found for this application",
      });
    }

    res.status(200).json({
      success: true,
      message: "Interview details retrieved successfully",
      data: interview,
    });
  },
);

// Cancel/Reschedule interview
export const cancelInterview = asyncHandler(
  async (req: AuthRequest, res: Response) => {
    const { id } = req.params;
    const { reason } = req.body;

    if (!isValidObjectId(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid interview ID",
      });
    }

    const interview = await Interview.findById(id)
      .populate({
        path: "application",
        populate: [
          { path: "applicant", select: "firstName lastName email" },
          { path: "track", select: "name" },
        ],
      })
      .populate("interviewer", "firstName lastName email");

    if (!interview) {
      return res.status(404).json({
        success: false,
        message: "Interview not found",
      });
    }

    if (interview.status !== "scheduled") {
      return res.status(400).json({
        success: false,
        message: "Only scheduled interviews can be cancelled",
      });
    }

    // Update interview status
    interview.status = "cancelled";
    if (reason) interview.notes = reason;
    await interview.save();

    // Find and update the original slot to free up space
    const slot = await InterviewSlot.findOne({
      interviewer: interview.interviewer._id,
      date: {
        $gte: new Date(interview.scheduledDate.setHours(0, 0, 0, 0)),
        $lt: new Date(interview.scheduledDate.setHours(23, 59, 59, 999)),
      },
    });

    if (slot && slot.bookedCount > 0) {
      slot.bookedCount -= 1;
      await slot.save();
    }

    // Send cancellation emails
    try {
      const applicant = (interview.application as any).applicant;
      const interviewer = interview.interviewer as any;
      const trackName = (interview.application as any).track.name;

      await brevoEmailService.sendInterviewCancellationNotification(
        applicant.email,
        `${applicant.firstName} ${applicant.lastName}`,
        trackName,
        interview.scheduledDate,
        reason,
      );

      await brevoEmailService.sendInterviewCancellationNotification(
        interviewer.email,
        `${interviewer.firstName} ${interviewer.lastName}`,
        trackName,
        interview.scheduledDate,
        reason,
      );
    } catch (emailError) {
      console.error("Error sending cancellation emails:", emailError);
    }

    res.status(200).json({
      success: true,
      message: "Interview cancelled successfully",
      data: interview,
    });
  },
);

// Get all interview slots (Admin only - see all slots from all interviewers)
export const getAllInterviewSlots = asyncHandler(
  async (req: AuthRequest, res: Response) => {
    const {
      page = 1,
      limit = 10,
      date,
      interviewer,
      track,
      status,
    } = req.query;
    const userRole = req.user?.role;
    const userId = req.user?.id;

    // Build filter query
    const filter: any = {};

    if (date) {
      const queryDate = new Date(date as string);
      filter.date = {
        $gte: new Date(queryDate.setHours(0, 0, 0, 0)),
        $lt: new Date(queryDate.setHours(23, 59, 59, 999)),
      };
    }

    if (interviewer) {
      if (interviewer === "me") {
        filter.interviewer = userId;
      } else if (interviewer !== "all") {
        filter.interviewer = interviewer;
      }
    }

    if (status === "available") {
      filter.isAvailable = true;
    } else if (status === "booked") {
      filter.isAvailable = false;
    }

    const skip = (Number(page) - 1) * Number(limit);

    // Filter by track if specified
    if (track && track !== "all") {
      filter.tracks = { $in: [track] };
    }

    let slots = await InterviewSlot.find(filter)
      .populate("interviewer", "firstName lastName email role")
      .populate("tracks", "name")
      .sort({ date: 1, startTime: 1 })
      .skip(skip)
      .limit(Number(limit));

    const total = await InterviewSlot.countDocuments(filter);

    res.status(200).json({
      success: true,
      message: "All interview slots retrieved successfully",
      data: {
        slots,
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

// Get single interview slot by ID
export const getInterviewSlot = asyncHandler(
  async (req: AuthRequest, res: Response) => {
    const { id } = req.params;

    if (!isValidObjectId(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid slot ID",
      });
    }

    const slot = await InterviewSlot.findById(id)
      .populate("interviewer", "firstName lastName email role")
      .populate("tracks", "name");

    if (!slot) {
      return res.status(404).json({
        success: false,
        message: "Interview slot not found",
      });
    }

    // Get interviews scheduled for this slot
    const interviews = await Interview.find({
      interviewer: slot.interviewer._id,
      scheduledDate: {
        $gte: new Date(slot.date.setHours(0, 0, 0, 0)),
        $lt: new Date(slot.date.setHours(23, 59, 59, 999)),
      },
    }).populate({
      path: "application",
      populate: [
        { path: "applicant", select: "firstName lastName email" },
        { path: "track", select: "name" },
      ],
    });

    res.status(200).json({
      success: true,
      message: "Interview slot retrieved successfully",
      data: {
        slot: {
          ...slot.toObject(),
          interviews: interviews,
        },
      },
    });
  },
);

// Update interview slot
export const updateInterviewSlot = asyncHandler(
  async (req: AuthRequest, res: Response) => {
    const { id } = req.params;
    const {
      date,
      startTime,
      endTime,
      duration,
      maxInterviews,
      notes,
      meetingLink,
      isAvailable,
      tracks,
    } = req.body;

    if (!isValidObjectId(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid slot ID",
      });
    }

    const slot = await InterviewSlot.findById(id);

    if (!slot) {
      return res.status(404).json({
        success: false,
        message: "Interview slot not found",
      });
    }

    // Check if user is authorized to update this slot
    const userRole = req.user?.role;
    const userId = req.user?.id;

    if (userRole !== "admin" && slot.interviewer.toString() !== userId) {
      return res.status(403).json({
        success: false,
        message: "You can only update your own interview slots",
      });
    }

    // Update slot fields
    const updateData: any = {};
    if (date) updateData.date = new Date(date);
    if (startTime) updateData.startTime = startTime;
    if (endTime) updateData.endTime = endTime;
    if (duration) updateData.duration = duration;
    if (maxInterviews) updateData.maxInterviews = maxInterviews;
    if (notes !== undefined) updateData.notes = notes;
    if (meetingLink !== undefined) updateData.meetingLink = meetingLink;
    if (isAvailable !== undefined) updateData.isAvailable = isAvailable;
    if (tracks) updateData.tracks = tracks;

    const updatedSlot = await InterviewSlot.findByIdAndUpdate(
      id,
      { ...updateData, updatedAt: new Date() },
      { new: true, runValidators: true },
    )
      .populate("interviewer", "firstName lastName email role")
      .populate("tracks", "name");

    res.status(200).json({
      success: true,
      message: "Interview slot updated successfully",
      data: { slot: updatedSlot },
    });
  },
);

// Delete interview slot
export const deleteInterviewSlot = asyncHandler(
  async (req: AuthRequest, res: Response) => {
    const { id } = req.params;

    if (!isValidObjectId(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid slot ID",
      });
    }

    const slot = await InterviewSlot.findById(id);

    if (!slot) {
      return res.status(404).json({
        success: false,
        message: "Interview slot not found",
      });
    }

    // Check if user is authorized to delete this slot
    const userRole = req.user?.role;
    const userId = req.user?.id;

    if (userRole !== "admin" && slot.interviewer.toString() !== userId) {
      return res.status(403).json({
        success: false,
        message: "You can only delete your own interview slots",
      });
    }

    // Check if slot has any booked interviews
    if (slot.bookedCount > 0) {
      return res.status(400).json({
        success: false,
        message:
          "Cannot delete slot with booked interviews. Cancel interviews first.",
      });
    }

    await InterviewSlot.findByIdAndDelete(id);

    res.status(200).json({
      success: true,
      message: "Interview slot deleted successfully",
    });
  },
);
