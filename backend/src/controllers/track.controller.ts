import { Request, Response } from "express";
import { Track } from "../models/Track";

export const getTracks = async (req: Request, res: Response) => {
  try {
    const { isActive, page = 1, limit = 20 } = req.query;

    // Build filter query
    const filter: any = {};

    if (isActive !== undefined) {
      filter.isActive = isActive === "true";
    }

    const skip = (Number(page) - 1) * Number(limit);

    const tracks = await Track.find(filter)
      .sort({ name: 1 })
      .skip(skip)
      .limit(Number(limit));

    const total = await Track.countDocuments(filter);

    res.status(200).json({
      success: true,
      message: "Tracks retrieved successfully",
      data: {
        tracks,
        pagination: {
          total,
          page: Number(page),
          limit: Number(limit),
          pages: Math.ceil(total / Number(limit)),
        },
      },
    });
  } catch (error) {
    console.error("Get tracks error:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

export const getActiveTracks = async (req: Request, res: Response) => {
  try {
    const tracks = await Track.find({ isActive: true }).sort({ name: 1 });

    res.status(200).json({
      success: true,
      message: "Active tracks retrieved successfully",
      data: tracks,
    });
  } catch (error) {
    console.error("Get active tracks error:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

export const getTrackDetails = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const track = await Track.findById(id);

    if (!track) {
      return res.status(404).json({
        success: false,
        message: "Track not found",
      });
    }

    res.status(200).json({
      success: true,
      message: "Track details retrieved successfully",
      data: track,
    });
  } catch (error) {
    console.error("Get track details error:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

export const createTrack = async (req: Request, res: Response) => {
  try {
    const { name, description, isActive = true } = req.body;

    const track = new Track({
      name: name.trim(),
      description: description?.trim(),
      isActive,
    });

    await track.save();

    res.status(201).json({
      success: true,
      message: "Track created successfully",
      data: track,
    });
  } catch (error) {
    console.error("Create track error:", error);

    if (error instanceof Error && error.message.includes("duplicate key")) {
      return res.status(400).json({
        success: false,
        message: "A track with this name already exists",
      });
    }

    res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

export const updateTrack = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const updates = req.body;

    const track = await Track.findByIdAndUpdate(
      id,
      { ...updates, updatedAt: new Date() },
      { new: true, runValidators: true },
    );

    if (!track) {
      return res.status(404).json({
        success: false,
        message: "Track not found",
      });
    }

    res.status(200).json({
      success: true,
      message: "Track updated successfully",
      data: track,
    });
  } catch (error) {
    console.error("Update track error:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

export const deleteTrack = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const track = await Track.findByIdAndDelete(id);

    if (!track) {
      return res.status(404).json({
        success: false,
        message: "Track not found",
      });
    }

    res.status(200).json({
      success: true,
      message: "Track deleted successfully",
    });
  } catch (error) {
    console.error("Delete track error:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};
