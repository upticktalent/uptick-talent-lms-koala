import { Request, Response } from "express";
import { Cohort } from "../models/Cohort";
import { Track } from "../models/Track";

export const getCohorts = async (req: Request, res: Response) => {
  try {
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
      .populate("tracks", "name description")
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
  } catch (error) {
    console.error("Get cohorts error:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

export const getActiveCohorts = async (req: Request, res: Response) => {
  try {
    const cohorts = await Cohort.find({
      isAcceptingApplications: true,
      status: { $in: ["upcoming", "active"] },
    })
      .populate("tracks", "name description")
      .sort({ startDate: 1 });

    res.status(200).json({
      success: true,
      message: "Active cohorts retrieved successfully",
      data: cohorts,
    });
  } catch (error) {
    console.error("Get active cohorts error:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

export const getCohortDetails = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

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
  } catch (error) {
    console.error("Get cohort details error:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

export const createCohort = async (req: Request, res: Response) => {
  try {
    const {
      name,
      description,
      startDate,
      endDate,
      maxStudents,
      tracks,
      isAcceptingApplications = true,
    } = req.body;

    // Validate tracks exist
    const validTracks = await Track.find({ _id: { $in: tracks } });
    if (validTracks.length !== tracks.length) {
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
    });

    await cohort.save();
    await cohort.populate("tracks", "name description");

    res.status(201).json({
      success: true,
      message: "Cohort created successfully",
      data: cohort,
    });
  } catch (error) {
    console.error("Create cohort error:", error);

    if (error instanceof Error && error.message.includes("duplicate key")) {
      return res.status(400).json({
        success: false,
        message: "A cohort with this name already exists",
      });
    }

    res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

export const updateCohort = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const updates = req.body;

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
  } catch (error) {
    console.error("Update cohort error:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

export const deleteCohort = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

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
  } catch (error) {
    console.error("Delete cohort error:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};
