import { Request, Response } from "express";
import { Stream } from "../models/Stream.model";
import { Cohort } from "../models/Cohort.model";
import { Track } from "../models/Track.model";
import { AuthRequest } from "../middleware/auth";
import { asyncHandler, isValidObjectId } from "../utils/mongooseErrorHandler";
import { User } from "../models/User.model";

// Get all streams for a cohort and track
export const getStreams = asyncHandler(
  async (req: AuthRequest, res: Response) => {
    const { cohortId, trackId, page = 1, limit = 10, type } = req.query;

    // Build filter
    const filter: any = { isPublished: true };

    if (cohortId) {
      if (!isValidObjectId(cohortId as string)) {
        return res.status(400).json({
          success: false,
          message: "Invalid cohort ID",
        });
      }
      filter.cohort = cohortId;
    }

    if (trackId) {
      if (!isValidObjectId(trackId as string)) {
        return res.status(400).json({
          success: false,
          message: "Invalid track ID",
        });
      }
      filter.track = trackId;
    }

    if (type) {
      filter.type = type;
    }

    const skip = (Number(page) - 1) * Number(limit);

    const streams = await Stream.find(filter)
      .populate("cohort", "name cohortNumber description")
      .populate("track", "name trackId description color")
      .populate("createdBy", "firstName lastName email role")
      .populate("reactions.user", "firstName lastName")
      .populate("comments.user", "firstName lastName")
      .populate("comments.replies.user", "firstName lastName")
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

// Get stream by ID
export const getStreamById = asyncHandler(
  async (req: Request, res: Response) => {
    const { id } = req.params;

    if (!isValidObjectId(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid stream ID",
      });
    }

    const stream = await Stream.findById(id)
      .populate("cohort", "name cohortNumber description")
      .populate("track", "name trackId description color")
      .populate("createdBy", "firstName lastName email role")
      .populate("reactions.user", "firstName lastName")
      .populate("comments.user", "firstName lastName")
      .populate("comments.replies.user", "firstName lastName");

    if (!stream) {
      return res.status(404).json({
        success: false,
        message: "Stream not found",
      });
    }

    res.status(200).json({
      success: true,
      message: "Stream retrieved successfully",
      data: stream,
    });
  },
);

// Create new stream (mentor/admin only)
export const createStream = asyncHandler(
  async (req: AuthRequest, res: Response) => {
    const {
      cohortId,
      trackId,
      title,
      content,
      type,
      scheduledFor,
      attachments = [],
    } = req.body;

    // Validate cohort and track exist
    if (!isValidObjectId(cohortId) || !isValidObjectId(trackId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid cohort or track ID",
      });
    }

    const cohort = await Cohort.findById(cohortId);
    const track = await Track.findById(trackId);

    if (!cohort || !track) {
      return res.status(404).json({
        success: false,
        message: "Cohort or track not found",
      });
    }

    // Verify track belongs to cohort
    const trackExists = cohort.tracks.some(
      (ct: any) => ct.track.toString() === trackId,
    );

    if (!trackExists) {
      return res.status(400).json({
        success: false,
        message: "Track does not belong to this cohort",
      });
    }

    const stream = new Stream({
      cohort: cohortId,
      track: trackId,
      title,
      content,
      type,
      createdBy: req.user!.id,
      scheduledFor: scheduledFor ? new Date(scheduledFor) : undefined,
      attachments,
    });

    await stream.save();

    const populatedStream = await Stream.findById(stream._id)
      .populate("cohort", "name cohortNumber description")
      .populate("track", "name trackId description color")
      .populate("createdBy", "firstName lastName email role");

    res.status(201).json({
      success: true,
      message: "Stream created successfully",
      data: populatedStream,
    });
  },
);

// Update stream (creator only)
export const updateStream = asyncHandler(
  async (req: AuthRequest, res: Response) => {
    const { id } = req.params;
    const updates = req.body;

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

    // Check if user is the creator or admin
    if (
      stream.createdBy.toString() !== req.user!.id &&
      req.user!.role !== "admin"
    ) {
      return res.status(403).json({
        success: false,
        message: "Only the creator or admin can update this stream",
      });
    }

    const updatedStream = await Stream.findByIdAndUpdate(
      id,
      { ...updates, updatedAt: new Date() },
      { new: true, runValidators: true },
    )
      .populate("cohort", "name cohortNumber description")
      .populate("track", "name trackId description color")
      .populate("createdBy", "firstName lastName email role");

    res.status(200).json({
      success: true,
      message: "Stream updated successfully",
      data: updatedStream,
    });
  },
);

// Delete stream (creator only)
export const deleteStream = asyncHandler(
  async (req: AuthRequest, res: Response) => {
    const { id } = req.params;

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

    // Check if user is the creator or admin
    if (
      stream.createdBy.toString() !== req.user!.id &&
      req.user!.role !== "admin"
    ) {
      return res.status(403).json({
        success: false,
        message: "Only the creator or admin can delete this stream",
      });
    }

    await Stream.findByIdAndDelete(id);

    res.status(200).json({
      success: true,
      message: "Stream deleted successfully",
    });
  },
);

// Add reaction to stream
export const addReaction = asyncHandler(
  async (req: AuthRequest, res: Response) => {
    const { id } = req.params;
    const { reactionType } = req.body;

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

    // Check if user already reacted
    const existingReactionIndex = stream.reactions.findIndex(
      (reaction) => reaction.user.toString() === req.user!.id,
    );

    if (existingReactionIndex !== -1) {
      // Update existing reaction
      stream.reactions[existingReactionIndex].type = reactionType;
    } else {
      // Add new reaction
      stream.reactions.push({
        user: req.user!.id as any,
        type: reactionType,
        createdAt: new Date(),
      });
    }

    await stream.save();

    const updatedStream = await Stream.findById(id).populate(
      "reactions.user",
      "firstName lastName",
    );

    res.status(200).json({
      success: true,
      message: "Reaction added successfully",
      data: updatedStream,
    });
  },
);

// Remove reaction from stream
export const removeReaction = asyncHandler(
  async (req: AuthRequest, res: Response) => {
    const { id } = req.params;

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

    // Remove user's reaction
    stream.reactions = stream.reactions.filter(
      (reaction) => reaction.user.toString() !== req.user!.id,
    );

    await stream.save();

    const updatedStream = await Stream.findById(id).populate(
      "reactions.user",
      "firstName lastName",
    );

    res.status(200).json({
      success: true,
      message: "Reaction removed successfully",
      data: updatedStream,
    });
  },
);

// Add comment to stream
export const addComment = asyncHandler(
  async (req: AuthRequest, res: Response) => {
    const { id } = req.params;
    const { content } = req.body;

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

    stream.comments.push({
      user: req.user!.id as any,
      content,
      replies: [],
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    await stream.save();

    const updatedStream = await Stream.findById(id)
      .populate("comments.user", "firstName lastName")
      .populate("comments.replies.user", "firstName lastName");

    res.status(200).json({
      success: true,
      message: "Comment added successfully",
      data: updatedStream,
    });
  },
);

// Add reply to comment
export const addCommentReply = asyncHandler(
  async (req: AuthRequest, res: Response) => {
    const { id, commentId } = req.params;
    const { content } = req.body;

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

    const comment = (stream.comments as any).id(commentId);

    if (!comment) {
      return res.status(404).json({
        success: false,
        message: "Comment not found",
      });
    }

    comment.replies.push({
      user: req.user!.id as any,
      content,
      createdAt: new Date(),
    });

    comment.updatedAt = new Date();
    await stream.save();

    const updatedStream = await Stream.findById(id)
      .populate("comments.user", "firstName lastName")
      .populate("comments.replies.user", "firstName lastName");

    res.status(200).json({
      success: true,
      message: "Reply added successfully",
      data: updatedStream,
    });
  },
);

// Get streams for student dashboard
export const getStudentStreams = asyncHandler(
  async (req: AuthRequest, res: Response) => {
    const userId = req.user!.id;

    // Get user's current cohort and track
    const user = await User.findById(userId).select(
      "currentCohort currentTrack",
    );

    if (!user || !user.currentCohort || !user.currentTrack) {
      return res.status(400).json({
        success: false,
        message: "User is not enrolled in any cohort or track",
      });
    }

    const streams = await Stream.find({
      cohort: user.currentCohort,
      track: user.currentTrack,
      isPublished: true,
      $or: [
        { scheduledFor: { $exists: false } },
        { scheduledFor: { $lte: new Date() } },
      ],
    })
      .populate("cohort", "name cohortNumber")
      .populate("track", "name trackId")
      .populate("createdBy", "firstName lastName")
      .populate("reactions.user", "firstName lastName")
      .populate("comments.user", "firstName lastName")
      .populate("comments.replies.user", "firstName lastName")
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      message: "Student streams retrieved successfully",
      data: streams,
    });
  },
);

// Get streams for mentor dashboard
export const getMentorStreams = asyncHandler(
  async (req: AuthRequest, res: Response) => {
    const userId = req.user!.id;

    // Get user's assigned tracks
    const user = await User.findById(userId).select("assignedTracks");

    if (!user || !user.assignedTracks || user.assignedTracks.length === 0) {
      return res.status(400).json({
        success: false,
        message: "Mentor is not assigned to any tracks",
      });
    }

    const streams = await Stream.find({
      track: { $in: user.assignedTracks },
    })
      .populate("cohort", "name cohortNumber")
      .populate("track", "name trackId")
      .populate("createdBy", "firstName lastName")
      .populate("reactions.user", "firstName lastName")
      .populate("comments.user", "firstName lastName")
      .populate("comments.replies.user", "firstName lastName")
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      message: "Mentor streams retrieved successfully",
      data: streams,
    });
  },
);

// Upload attachment for stream (placeholder - would integrate with file upload service)
export const uploadAttachment = asyncHandler(
  async (req: AuthRequest, res: Response) => {
    try {
      const files = req.files as Express.Multer.File[];
      
      if (!files || files.length === 0) {
        return res.status(400).json({
          success: false,
          message: "No files uploaded",
        });
      }

      const uploadedFiles = files.map((file: any) => {
        // Determine file type based on mimetype
        let fileType = 'file';
        if (file.mimetype.startsWith('image/')) {
          fileType = 'image';
        } else if (file.mimetype.startsWith('video/')) {
          fileType = 'video';
        } else if (file.mimetype === 'application/pdf' || 
                   file.mimetype.includes('document') || 
                   file.mimetype === 'text/plain') {
          fileType = 'document';
        }

        return {
          url: file.path, // Cloudinary URL
          title: file.originalname,
          type: fileType,
          size: file.size,
          publicId: file.public_id,
          mimetype: file.mimetype,
        };
      });

      res.status(200).json({
        success: true,
        message: `${files.length} file(s) uploaded successfully`,
        data: uploadedFiles.length === 1 ? uploadedFiles[0] : uploadedFiles,
      });
    } catch (error) {
      console.error("Error uploading stream attachment:", error);
      res.status(500).json({
        success: false,
        message: "Failed to upload attachment",
      });
    }
  },
);

// Get stream analytics (mentor/admin only)
export const getStreamAnalytics = asyncHandler(
  async (req: AuthRequest, res: Response) => {
    const { id } = req.params;

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

    // Calculate analytics
    const analytics = {
      totalViews: Math.floor(Math.random() * 100) + 10, // Mock data
      totalReactions: stream.reactions.length,
      totalComments: stream.comments.length,
      reactionBreakdown: {
        like: stream.reactions.filter((r) => r.type === "like").length,
        love: stream.reactions.filter((r) => r.type === "love").length,
        helpful: stream.reactions.filter((r) => r.type === "helpful").length,
        confused: stream.reactions.filter((r) => r.type === "confused").length,
      },
      engagementRate:
        (
          ((stream.reactions.length + stream.comments.length) /
            Math.max(Math.floor(Math.random() * 100) + 10, 1)) *
          100
        ).toFixed(2) + "%",
      createdAt: stream.createdAt,
      lastActivity: stream.updatedAt,
    };

    res.status(200).json({
      success: true,
      message: "Stream analytics retrieved successfully",
      data: analytics,
    });
  },
);
