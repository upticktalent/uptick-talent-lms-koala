import { Request, Response, NextFunction } from "express";
import { Cohort } from "../models/Cohort.model";
import { Track } from "../models/Track.model";
import { asyncHandler, isValidObjectId } from "../utils/mongooseErrorHandler";

export const getCohorts = asyncHandler(async (req: Request, res: Response) => {
  const { status, isAcceptingApplications, page = 1, limit = 10 } = req.query;

  // Build filter query
  const filter: any = {};

  if (status) {
    filter.status = status;
  }

  if (isAcceptingApplications !== undefined) {
    filter.isAcceptingApplications = isAcceptingApplications === "true";
  }

  const skip = (Number(page) - 1) * Number(limit);

  const cohorts = await Cohort.find(filter)
    .populate("tracks.track", "name trackId description")
    .populate("tracks.mentors", "firstName lastName email")
    .sort({ startDate: -1 })
    .skip(skip)
    .limit(Number(limit));

  const total = await Cohort.countDocuments(filter);

  res.status(200).json({
    success: true,
    message: "Cohorts retrieved successfully",
    data: {
      cohorts,
      pagination: {
        total,
        page: Number(page),
        limit: Number(limit),
        pages: Math.ceil(total / Number(limit)),
      },
    },
  });
});

export const getActiveCohorts = asyncHandler(
  async (req: Request, res: Response) => {
    const now = new Date();

    // Only return active cohorts that are accepting applications and haven't passed deadline
    const cohorts = await Cohort.find({
      status: "active",
      isAcceptingApplications: true,
      applicationDeadline: { $gt: now }, // Application deadline hasn't passed
    })
      .populate("tracks", "name description")
      .sort({ startDate: 1 });

    res.status(200).json({
      success: true,
      message: "Active cohorts retrieved successfully",
      data: cohorts,
    });
  },
);

export const getCurrentActiveCohort = asyncHandler(
  async (req: Request, res: Response) => {
    const activeCohort = await Cohort.getCurrentActive();

    if (!activeCohort) {
      return res.status(404).json({
        success: false,
        message: "No active cohort found",
      });
    }

    res.status(200).json({
      success: true,
      message: "Active cohort retrieved successfully",
      data: activeCohort,
    });
  },
);

export const getCohortDetails = asyncHandler(
  async (req: Request, res: Response) => {
    const { id } = req.params;

    // Validate ObjectId format
    if (!isValidObjectId(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid cohort ID",
      });
    }

    const cohort = await Cohort.findById(id).populate(
      "tracks",
      "name description",
    );

    if (!cohort) {
      return res.status(404).json({
        success: false,
        message: "Cohort not found",
      });
    }

    res.status(200).json({
      success: true,
      message: "Cohort details retrieved successfully",
      data: cohort,
    });
  },
);

export const createCohort = asyncHandler(
  async (req: Request, res: Response) => {
    const {
      name,
      description,
      startDate,
      endDate,
      maxStudents,
      tracks,
      cohortNumber,
      isAcceptingApplications = true,
    } = req.body;

    // Validate tracks exist
    const validTracks = await Track.find({ _id: { $in: tracks } });
    if (!validTracks || validTracks.length !== tracks?.length) {
      return res.status(400).json({
        success: false,
        message: "One or more tracks are invalid",
      });
    }

    const cohort = new Cohort({
      name: name.trim(),
      description: description?.trim(),
      startDate: new Date(startDate),
      endDate: new Date(endDate),
      maxStudents,
      tracks,
      isAcceptingApplications,
      cohortNumber,
    });

    await cohort.save();
    await cohort.populate("tracks", "name description");

    res.status(201).json({
      success: true,
      message: "Cohort created successfully",
      data: cohort,
    });
  },
);

export const updateCohort = asyncHandler(
  async (req: Request, res: Response) => {
    const { id } = req.params;
    const updates = req.body;

    // Validate ObjectId format
    if (!isValidObjectId(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid cohort ID",
      });
    }

    // Validate tracks if provided
    if (updates.tracks) {
      const validTracks = await Track.find({ _id: { $in: updates.tracks } });
      if (validTracks.length !== updates.tracks.length) {
        return res.status(400).json({
          success: false,
          message: "One or more tracks are invalid",
        });
      }
    }

    const cohort = await Cohort.findByIdAndUpdate(
      id,
      { ...updates, updatedAt: new Date() },
      { new: true, runValidators: true },
    ).populate("tracks", "name description");

    if (!cohort) {
      return res.status(404).json({
        success: false,
        message: "Cohort not found",
      });
    }

    res.status(200).json({
      success: true,
      message: "Cohort updated successfully",
      data: cohort,
    });
  },
);

export const deleteCohort = asyncHandler(
  async (req: Request, res: Response) => {
    const { id } = req.params;

    // Validate ObjectId format
    if (!isValidObjectId(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid cohort ID",
      });
    }

    const cohort = await Cohort.findByIdAndDelete(id);

    if (!cohort) {
      return res.status(404).json({
        success: false,
        message: "Cohort not found",
      });
    }

    res.status(200).json({
      success: true,
      message: "Cohort deleted successfully",
    });
  },
);

// Set a cohort as currently active for applications
export const setActiveCohort = asyncHandler(
  async (req: Request, res: Response) => {
    const { id } = req.params;

    // Validate ObjectId format
    if (!isValidObjectId(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid cohort ID",
      });
    }

    try {
      const activeCohort = await Cohort.setCurrentlyActive(id);

      if (!activeCohort) {
        return res.status(404).json({
          success: false,
          message: "Cohort not found",
        });
      }

      res.status(200).json({
        success: true,
        message: "Cohort set as currently active",
        data: activeCohort,
      });
    } catch (error) {
      res.status(400).json({
        success: false,
        message:
          error instanceof Error
            ? error.message
            : "Failed to set cohort as active",
      });
    }
  },
);

// Add tracks to a cohort
export const addTracksToCohor = asyncHandler(
  async (req: Request, res: Response) => {
    const { id } = req.params;
    const { tracks } = req.body; // Array of { trackId, mentors: [mentorIds], maxStudents }

    // Validate ObjectId format
    if (!isValidObjectId(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid cohort ID",
      });
    }

    if (!Array.isArray(tracks) || tracks.length === 0) {
      return res.status(400).json({
        success: false,
        message: "Tracks array is required",
      });
    }

    const cohort = await Cohort.findById(id);
    if (!cohort) {
      return res.status(404).json({
        success: false,
        message: "Cohort not found",
      });
    }

    // Validate tracks exist
    const trackIds = tracks.map((t) => t.trackId);
    const existingTracks = await Track.find({ _id: { $in: trackIds } });

    if (existingTracks.length !== trackIds.length) {
      return res.status(400).json({
        success: false,
        message: "One or more tracks not found",
      });
    }

    // Add tracks to cohort
    for (const trackData of tracks) {
      const existingTrackIndex = cohort.tracks.findIndex(
        (ct: any) => ct.track.toString() === trackData.trackId,
      );

      if (existingTrackIndex === -1) {
        cohort.tracks.push({
          track: trackData.trackId,
          mentors: trackData.mentors || [],
          maxStudents: trackData.maxStudents,
          currentStudents: 0,
        });
      } else {
        // Update existing track
        cohort.tracks[existingTrackIndex].mentors = trackData.mentors || [];
        if (trackData.maxStudents) {
          cohort.tracks[existingTrackIndex].maxStudents = trackData.maxStudents;
        }
      }
    }

    await cohort.save();

    const updatedCohort = await Cohort.findById(id)
      .populate("tracks.track", "name trackId description")
      .populate("tracks.mentors", "firstName lastName email");

    res.status(200).json({
      success: true,
      message: "Tracks added to cohort successfully",
      data: updatedCohort,
    });
  },
);

// Remove track from cohort
export const removeTrackFromCohort = asyncHandler(
  async (req: Request, res: Response) => {
    const { id, trackId } = req.params;

    // Validate ObjectId format
    if (!isValidObjectId(id) || !isValidObjectId(trackId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid cohort or track ID",
      });
    }

    const cohort = await Cohort.findById(id);
    if (!cohort) {
      return res.status(404).json({
        success: false,
        message: "Cohort not found",
      });
    }

    // Remove track from cohort
    cohort.tracks = cohort.tracks.filter(
      (ct: any) => ct.track.toString() !== trackId,
    );

    await cohort.save();

    const updatedCohort = await Cohort.findById(id)
      .populate("tracks.track", "name trackId description")
      .populate("tracks.mentors", "firstName lastName email");

    res.status(200).json({
      success: true,
      message: "Track removed from cohort successfully",
      data: updatedCohort,
    });
  },
);

// Get cohort tracks with student and mentor details
export const getCohortTracks = asyncHandler(
  async (req: Request, res: Response) => {
    const { id } = req.params;

    // Validate ObjectId format
    if (!isValidObjectId(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid cohort ID",
      });
    }

    const cohort = await Cohort.findById(id)
      .populate("tracks.track", "name trackId description")
      .populate("tracks.mentors", "firstName lastName email role");

    if (!cohort) {
      return res.status(404).json({
        success: false,
        message: "Cohort not found",
      });
    }

    res.status(200).json({
      success: true,
      message: "Cohort tracks retrieved successfully",
      data: {
        cohort: {
          _id: cohort._id,
          name: cohort.name,
          cohortNumber: cohort.cohortNumber,
        },
        tracks: cohort.tracks,
      },
    });
  },
);
