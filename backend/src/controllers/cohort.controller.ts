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
    .populate("tracks.track", "name trackId description isActive")
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
      .populate("tracks.track", "name trackId description isActive")
      .populate("tracks.mentors", "firstName lastName email")
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
        message: "No currently active cohort found",
      });
    }

    res.status(200).json({
      success: true,
      message: "Currently active cohort retrieved successfully",
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

    const cohort = await Cohort.findById(id)
      .populate("tracks.track", "name trackId description isActive")
      .populate("tracks.mentors", "firstName lastName email");

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
      applicationDeadline,
      isAcceptingApplications = true,
    } = req.body;
    console.log(req.body);

    // Handle both old format (array of track IDs) and new format (array of ICohortTrack objects)
    let formattedTracks = [];
    if (tracks && tracks.length > 0) {
      if (typeof tracks[0] === "string") {
        // Old format: simple array of track IDs
        const validTracks = await Track.find({ _id: { $in: tracks } });
        if (!validTracks || validTracks.length !== tracks?.length) {
          return res.status(400).json({
            success: false,
            message: "One or more tracks are invalid",
          });
        }
        formattedTracks = tracks.map((trackId: string) => ({
          track: trackId,
          mentors: [],
          currentStudents: 0,
        }));
      } else {
        // New format: array of ICohortTrack objects
        const trackIds = tracks.map((t: any) => t.track || t.trackId);
        const validTracks = await Track.find({ _id: { $in: trackIds } });
        if (!validTracks || validTracks.length !== trackIds.length) {
          return res.status(400).json({
            success: false,
            message: "One or more tracks are invalid",
          });
        }
        formattedTracks = tracks.map((t: any) => ({
          track: t.track || t.trackId,
          mentors: t.mentors || [],
          maxStudents: t.maxStudents,
          currentStudents: t.currentStudents || 0,
        }));
      }
    }

    const cohort = new Cohort({
      name: name.trim(),
      description: description?.trim(),
      startDate: new Date(startDate),
      endDate: new Date(endDate),
      maxStudents,
      tracks: formattedTracks,
      applicationDeadline,
      isAcceptingApplications,
      cohortNumber,
    });

    await cohort.save();
    await cohort.populate("tracks.track", "name trackId description isActive");
    await cohort.populate("tracks.mentors", "firstName lastName email");

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
    )
      .populate("tracks.track", "name trackId description isActive")
      .populate("tracks.mentors", "firstName lastName email");

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

// Set cohort as currently active
export const setCurrentlyActive = asyncHandler(
  async (req: Request, res: Response) => {
    const { id } = req.params;

    if (!isValidObjectId(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid cohort ID",
      });
    }

    const cohort = await Cohort.setCurrentlyActive(id);

    if (!cohort) {
      return res.status(404).json({
        success: false,
        message: "Cohort not found",
      });
    }

    res.status(200).json({
      success: true,
      message: "Cohort set as currently active",
      data: cohort,
    });
  },
);

// Add track to cohort
export const addTrackToCohort = asyncHandler(
  async (req: Request, res: Response) => {
    const { id } = req.params;
    const { trackId, mentorIds = [], maxStudents } = req.body;

    if (!isValidObjectId(id) || !isValidObjectId(trackId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid cohort or track ID",
      });
    }

    // Verify track exists
    const track = await Track.findById(trackId);
    if (!track) {
      return res.status(404).json({
        success: false,
        message: "Track not found",
      });
    }

    const cohort = await Cohort.findById(id);
    if (!cohort) {
      return res.status(404).json({
        success: false,
        message: "Cohort not found",
      });
    }

    // Check if track already exists in cohort
    if (cohort.hasTrack(trackId)) {
      return res.status(400).json({
        success: false,
        message: "Track already exists in this cohort",
      });
    }

    // Add track to cohort
    cohort.tracks.push({
      track: trackId,
      mentors: mentorIds,
      maxStudents,
      currentStudents: 0,
      isActive: true,
      settings: {
        allowLateSubmissions: false,
        autoGrading: false,
        discussionEnabled: true,
        resourceSharing: true,
      },
    } as any);

    await cohort.save();

    const updatedCohort = await Cohort.findById(id)
      .populate("tracks.track", "name trackId description isActive")
      .populate("tracks.mentors", "firstName lastName email");

    res.status(200).json({
      success: true,
      message: "Track added to cohort successfully",
      data: updatedCohort,
    });
  },
);

// Remove track from cohort
export const removeTrackFromCohort = asyncHandler(
  async (req: Request, res: Response) => {
    const { id, trackId } = req.params;

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
      .populate("tracks.track", "name trackId description isActive")
      .populate("tracks.mentors", "firstName lastName email");

    res.status(200).json({
      success: true,
      message: "Track removed from cohort successfully",
      data: updatedCohort,
    });
  },
);

// Add mentor to cohort track
export const addMentorToTrack = asyncHandler(
  async (req: Request, res: Response) => {
    const { id, trackId } = req.params;
    const { mentorId } = req.body;

    if (
      !isValidObjectId(id) ||
      !isValidObjectId(trackId) ||
      !isValidObjectId(mentorId)
    ) {
      return res.status(400).json({
        success: false,
        message: "Invalid cohort, track, or mentor ID",
      });
    }

    const cohort = await Cohort.findById(id);
    if (!cohort) {
      return res.status(404).json({
        success: false,
        message: "Cohort not found",
      });
    }

    try {
      await cohort.addMentorToTrack(trackId, mentorId);

      const updatedCohort = await Cohort.findById(id)
        .populate("tracks.track", "name trackId description isActive")
        .populate("tracks.mentors", "firstName lastName email");

      res.status(200).json({
        success: true,
        message: "Mentor added to track successfully",
        data: updatedCohort,
      });
    } catch (error: any) {
      res.status(400).json({
        success: false,
        message: error.message,
      });
    }
  },
);

// Remove mentor from cohort track
export const removeMentorFromTrack = asyncHandler(
  async (req: Request, res: Response) => {
    const { id, trackId, mentorId } = req.params;

    if (
      !isValidObjectId(id) ||
      !isValidObjectId(trackId) ||
      !isValidObjectId(mentorId)
    ) {
      return res.status(400).json({
        success: false,
        message: "Invalid cohort, track, or mentor ID",
      });
    }

    const cohort = await Cohort.findById(id);
    if (!cohort) {
      return res.status(404).json({
        success: false,
        message: "Cohort not found",
      });
    }

    const trackIndex = cohort.tracks.findIndex(
      (ct: any) => ct.track.toString() === trackId,
    );

    if (trackIndex === -1) {
      return res.status(404).json({
        success: false,
        message: "Track not found in cohort",
      });
    }

    // Remove mentor from track
    cohort.tracks[trackIndex].mentors = cohort.tracks[
      trackIndex
    ].mentors.filter((m: any) => m.toString() !== mentorId);

    await cohort.save();

    const updatedCohort = await Cohort.findById(id)
      .populate("tracks.track", "name trackId description isActive")
      .populate("tracks.mentors", "firstName lastName email");

    res.status(200).json({
      success: true,
      message: "Mentor removed from track successfully",
      data: updatedCohort,
    });
  },
);

// Get track details within current active cohort context
export const getTrackInActiveCohort = asyncHandler(
  async (req: Request, res: Response) => {
    const { trackId } = req.params;

    // Get current active cohort
    const activeCohort = await Cohort.getCurrentActive();

    if (!activeCohort) {
      return res.status(404).json({
        success: false,
        message: "No currently active cohort found",
      });
    }

    // Find the track within this cohort
    const cohortTrack = activeCohort.tracks.find(
      (ct: any) => ct.track.trackId === trackId || ct.track._id.toString() === trackId
    );

    if (!cohortTrack) {
      return res.status(404).json({
        success: false,
        message: "Track not found in current active cohort",
      });
    }

    // Get additional track data and populate students
    const User = require("../models/User.model").User;
    const students = await User.find({
      role: "student",
      currentCohort: activeCohort._id,
      currentTrack: cohortTrack.track._id,
      isActive: true,
    }).select("firstName lastName email");

    const trackDetails = {
      cohort: {
        _id: activeCohort._id,
        name: activeCohort.name,
        cohortNumber: activeCohort.cohortNumber,
        startDate: activeCohort.startDate,
        endDate: activeCohort.endDate,
      },
      track: cohortTrack.track,
      mentors: cohortTrack.mentors,
      maxStudents: cohortTrack.maxStudents,
      currentStudents: cohortTrack.currentStudents,
      students: students,
    };

    res.status(200).json({
      success: true,
      message: "Track details retrieved successfully",
      data: trackDetails,
    });
  },
);

// New Cohort-Centric Methods

export const getCohortComplete = asyncHandler(
  async (req: Request, res: Response) => {
    const { cohortId } = req.params;

    if (!isValidObjectId(cohortId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid cohort ID format",
      });
    }

    const cohort = await Cohort.findById(cohortId);

    if (!cohort) {
      return res.status(404).json({
        success: false,
        message: "Cohort not found",
      });
    }

    // Get complete cohort data with all relations
    const completeData = await cohort.getCompleteData();

    res.status(200).json({
      success: true,
      message: "Complete cohort data retrieved successfully",
      data: completeData,
    });
  }
);

export const getCohortTrackData = asyncHandler(
  async (req: Request, res: Response) => {
    const { cohortId, trackId } = req.params;

    if (!isValidObjectId(cohortId) || !isValidObjectId(trackId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid cohort or track ID format",
      });
    }

    const cohort = await Cohort.findById(cohortId);

    if (!cohort) {
      return res.status(404).json({
        success: false,
        message: "Cohort not found",
      });
    }

    const cohortTrack = cohort.getTrackById(trackId);

    if (!cohortTrack) {
      return res.status(404).json({
        success: false,
        message: "Track not found in this cohort",
      });
    }

    // Get complete data for this specific track
    const completeData = await cohort.getCompleteData();
    const trackData = completeData.trackData.find(
      (td: any) => td.track._id.toString() === trackId
    );

    res.status(200).json({
      success: true,
      message: "Track data retrieved successfully",
      data: trackData,
    });
  }
);

export const getCohortStatistics = asyncHandler(
  async (req: Request, res: Response) => {
    const { cohortId } = req.params;

    if (!isValidObjectId(cohortId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid cohort ID format",
      });
    }

    const cohort = await Cohort.findById(cohortId);

    if (!cohort) {
      return res.status(404).json({
        success: false,
        message: "Cohort not found",
      });
    }

    // Update statistics for all tracks
    for (const cohortTrack of cohort.tracks) {
      await cohort.updateTrackStatistics(cohortTrack.track.toString());
    }

    // Get updated cohort with fresh statistics
    const updatedCohort = await Cohort.findById(cohortId)
      .populate("tracks.track", "name trackId description")
      .populate("tracks.mentors", "firstName lastName email");

    const statistics = {
      cohort: {
        _id: updatedCohort!._id,
        name: updatedCohort!.name,
        cohortNumber: updatedCohort!.cohortNumber,
        status: updatedCohort!.status,
      },
      overallStatistics: {
        totalTracks: updatedCohort!.tracks.length,
        totalMentors: updatedCohort!.tracks.reduce(
          (sum, track) => sum + track.mentors.length,
          0
        ),
        totalStudents: updatedCohort!.currentStudents,
        totalApplications: updatedCohort!.tracks.reduce(
          (sum, track) => sum + (track.statistics?.totalApplications || 0),
          0
        ),
      },
      trackStatistics: updatedCohort!.tracks.map((cohortTrack) => ({
        track: cohortTrack.track,
        mentors: cohortTrack.mentors,
        settings: cohortTrack.settings,
        statistics: cohortTrack.statistics,
        currentStudents: cohortTrack.currentStudents,
        maxStudents: cohortTrack.maxStudents,
        isActive: cohortTrack.isActive,
      })),
    };

    res.status(200).json({
      success: true,
      message: "Cohort statistics retrieved successfully",
      data: statistics,
    });
  }
);

export const getCohortApplications = asyncHandler(
  async (req: Request, res: Response) => {
    const { cohortId } = req.params;
    const { trackId, status, page = 1, limit = 10 } = req.query;

    if (!isValidObjectId(cohortId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid cohort ID format",
      });
    }

    const cohort = await Cohort.findById(cohortId);

    if (!cohort) {
      return res.status(404).json({
        success: false,
        message: "Cohort not found",
      });
    }

    // Get track IDs for this cohort
    let trackIds = cohort.tracks.map((ct) => ct.track);

    // Filter by specific track if provided
    if (trackId) {
      if (!isValidObjectId(trackId as string)) {
        return res.status(400).json({
          success: false,
          message: "Invalid track ID format",
        });
      }

      if (!cohort.hasTrack(trackId as string)) {
        return res.status(404).json({
          success: false,
          message: "Track not found in this cohort",
        });
      }

      trackIds = [trackId as any];
    }

    // Build filter query
    const filter: any = { track: { $in: trackIds } };

    if (status) {
      filter.status = status;
    }

    const skip = (Number(page) - 1) * Number(limit);

    const Application = require("../models/Application.model").Application;

    const applications = await Application.find(filter)
      .populate("applicant", "firstName lastName email phoneNumber")
      .populate("track", "name trackId description")
      .populate("reviewedBy", "firstName lastName email")
      .sort({ submittedAt: -1 })
      .skip(skip)
      .limit(Number(limit));

    const total = await Application.countDocuments(filter);

    res.status(200).json({
      success: true,
      message: "Cohort applications retrieved successfully",
      data: {
        applications,
        cohort: {
          _id: cohort._id,
          name: cohort.name,
          cohortNumber: cohort.cohortNumber,
        },
        pagination: {
          total,
          page: Number(page),
          limit: Number(limit),
          pages: Math.ceil(total / Number(limit)),
        },
      },
    });
  }
);

export const getCohortStudents = asyncHandler(
  async (req: Request, res: Response) => {
    const { cohortId } = req.params;
    const { trackId } = req.query;

    if (!isValidObjectId(cohortId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid cohort ID format",
      });
    }

    const cohort = await Cohort.findById(cohortId);

    if (!cohort) {
      return res.status(404).json({
        success: false,
        message: "Cohort not found",
      });
    }

    // Build filter query
    const filter: any = {
      role: "student",
      "trackAssignments.cohort": cohortId,
      "trackAssignments.isActive": true,
    };

    if (trackId) {
      if (!isValidObjectId(trackId as string)) {
        return res.status(400).json({
          success: false,
          message: "Invalid track ID format",
        });
      }
      filter["trackAssignments.track"] = trackId;
    }

    const User = require("../models/User.model").User;

    const students = await User.find(filter)
      .populate("trackAssignments.track", "name trackId")
      .populate("trackAssignments.cohort", "name cohortNumber")
      .select("firstName lastName email phoneNumber trackAssignments createdAt");

    // Group students by track if no specific track is requested
    if (!trackId) {
      const studentsByTrack = cohort.tracks.map((cohortTrack) => {
        const trackStudents = students.filter((student: any) =>
          student.trackAssignments.some(
            (assignment: any) =>
              assignment.track._id.toString() === cohortTrack.track.toString() &&
              assignment.cohort._id.toString() === cohortId &&
              assignment.isActive
          )
        );

        return {
          track: cohortTrack.track,
          mentors: cohortTrack.mentors,
          students: trackStudents,
          count: trackStudents.length,
        };
      });

      return res.status(200).json({
        success: true,
        message: "Cohort students retrieved successfully",
        data: {
          cohort: {
            _id: cohort._id,
            name: cohort.name,
            cohortNumber: cohort.cohortNumber,
          },
          studentsByTrack,
          totalStudents: students.length,
        },
      });
    }

    res.status(200).json({
      success: true,
      message: "Track students retrieved successfully",
      data: {
        cohort: {
          _id: cohort._id,
          name: cohort.name,
          cohortNumber: cohort.cohortNumber,
        },
        students,
        totalStudents: students.length,
      },
    });
  }
);
