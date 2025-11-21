import { Request, Response } from "express";
import { Stream } from "../models/Stream.model";
import { Cohort } from "../models/Cohort.model";
import { User } from "../models/User.model";
import { AuthRequest } from "../middleware/auth";
import { asyncHandler, isValidObjectId } from "../utils/mongooseErrorHandler";

// Create a new stream/announcement
export const createStream = asyncHandler(
  async (req: AuthRequest, res: Response) => {
    const { cohortId, trackId, title, content, isImportant, attachments } =
      req.body;
    const user = req.user!;

    // Validate cohort exists
    if (!isValidObjectId(cohortId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid cohort ID",
      });
    }

    const cohort = await Cohort.findById(cohortId);
    if (!cohort) {
      return res.status(404).json({
        success: false,
        message: "Cohort not found",
      });
    }

    // Check user permissions
    if (user.role === "mentor") {
      // Mentors can only create streams for their assigned tracks
      const hasAccess = user.hasAccessToTrack(cohortId, trackId);
      if (!hasAccess) {
        return res.status(403).json({
          success: false,
          message: "You don't have permission to create streams for this track",
        });
      }
    } else if (user.role !== "admin") {
      return res.status(403).json({
        success: false,
        message: "Only admins and mentors can create streams",
      });
    }

    // If trackId is provided, validate it exists in the cohort
    if (trackId) {
      if (!isValidObjectId(trackId)) {
        return res.status(400).json({
          success: false,
          message: "Invalid track ID",
        });
      }

      const trackExists = cohort.hasTrack(trackId);
      if (!trackExists) {
        return res.status(400).json({
          success: false,
          message: "Track not found in this cohort",
        });
      }
    }

    const stream = new Stream({
      cohort: cohortId,
      track: trackId || null, // null means announcement for all tracks
      title: title.trim(),
      content: content.trim(),
      author: user._id,
      attachments: attachments || [],
      isImportant: isImportant || false,
    });

    await stream.save();

    const populatedStream = await Stream.findById(stream._id)
      .populate("author", "firstName lastName email role")
      .populate("track", "name trackId")
      .populate("cohort", "name cohortNumber");

    res.status(201).json({
      success: true,
      message: "Stream created successfully",
      data: populatedStream,
    });
  },
);

// Get streams for a cohort/track
export const getStreams = asyncHandler(
  async (req: AuthRequest, res: Response) => {
    const { cohortId } = req.params;
    const { trackId, page = 1, limit = 10 } = req.query;
    const user = req.user!;

    // Validate cohort exists
    if (!isValidObjectId(cohortId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid cohort ID",
      });
    }

    // Check user permissions
    if (user.role === "student") {
      // Students can only see streams for their own track
      if (user.studentCohort?.toString() !== cohortId) {
        return res.status(403).json({
          success: false,
          message: "Access denied",
        });
      }
    } else if (user.role === "mentor") {
      // Mentors can only see streams for their assigned tracks
      const cohorts = user.getMentorCohorts();
      if (!cohorts.some((c: any) => c.toString() === cohortId)) {
        return res.status(403).json({
          success: false,
          message: "Access denied",
        });
      }
    }

    // Build filter
    const filter: any = { cohort: cohortId };

    if (user.role === "student") {
      // Students see: 1) General announcements (no track), 2) Their track announcements
      filter.$or = [{ track: null }, { track: user.studentTrack }];
    } else if (user.role === "mentor" && trackId) {
      // Mentors can filter by specific track
      const hasAccessToTrack = user.hasAccessToTrack(
        cohortId,
        trackId as string,
      );
      if (!hasAccessToTrack) {
        return res.status(403).json({
          success: false,
          message: "Access denied to this track",
        });
      }
      filter.track = trackId;
    } else if (trackId) {
      // Admin filtering by track
      filter.track = trackId;
    }

    const skip = (Number(page) - 1) * Number(limit);

    const streams = await Stream.find(filter)
      .populate("author", "firstName lastName email role")
      .populate("track", "name trackId")
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(Number(limit));

    const total = await Stream.countDocuments(filter);

    res.status(200).json({
      success: true,
      message: "Streams retrieved successfully",
      data: {
        streams,
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

// Update stream
export const updateStream = asyncHandler(
  async (req: AuthRequest, res: Response) => {
    const { id } = req.params;
    const { title, content, isImportant, attachments } = req.body;
    const user = req.user!;

    if (!isValidObjectId(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid stream ID",
      });
    }

    const stream = await Stream.findById(id);
    if (!stream) {
      return res.status(404).json({
        success: false,
        message: "Stream not found",
      });
    }

    // Check permissions - only author or admin can update
    if (
      user.role !== "admin" &&
      stream.author.toString() !== user._id.toString()
    ) {
      return res.status(403).json({
        success: false,
        message: "You can only edit your own streams",
      });
    }

    // Update fields
    if (title) stream.title = title.trim();
    if (content) stream.content = content.trim();
    if (isImportant !== undefined) stream.isImportant = isImportant;
    if (attachments) stream.attachments = attachments;

    await stream.save();

    const updatedStream = await Stream.findById(stream._id)
      .populate("author", "firstName lastName email role")
      .populate("track", "name trackId")
      .populate("cohort", "name cohortNumber");

    res.status(200).json({
      success: true,
      message: "Stream updated successfully",
      data: updatedStream,
    });
  },
);

// Delete stream
export const deleteStream = asyncHandler(
  async (req: AuthRequest, res: Response) => {
    const { id } = req.params;
    const user = req.user!;

    if (!isValidObjectId(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid stream ID",
      });
    }

    const stream = await Stream.findById(id);
    if (!stream) {
      return res.status(404).json({
        success: false,
        message: "Stream not found",
      });
    }

    // Check permissions - only author or admin can delete
    if (
      user.role !== "admin" &&
      stream.author.toString() !== user._id.toString()
    ) {
      return res.status(403).json({
        success: false,
        message: "You can only delete your own streams",
      });
    }

    await Stream.findByIdAndDelete(id);

    res.status(200).json({
      success: true,
      message: "Stream deleted successfully",
    });
  },
);
