import { Request, Response } from "express";
import { Track } from "../models/Track";
import { asyncHandler, isValidObjectId } from "../utils/mongooseErrorHandler";

export const getTracks = asyncHandler(async (req: Request, res: Response) => {
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
});

export const getActiveTracks = asyncHandler(
  async (req: Request, res: Response) => {
    const tracks = await Track.find({ isActive: true }).sort({ name: 1 });

    res.status(200).json({
      success: true,
      message: "Active tracks retrieved successfully",
      data: tracks,
    });
  },
);

export const getTrackDetails = asyncHandler(
  async (req: Request, res: Response) => {
    const { id } = req.params;

    // Validate ObjectId format
    if (!isValidObjectId(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid track ID",
      });
    }

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
  },
);

export const createTrack = asyncHandler(async (req: Request, res: Response) => {
  const { name, description, trackId, isActive = true } = req.body;

  const track = new Track({
    name: name.trim(),
    description: description?.trim(),
    isActive,
    trackId,
  });

  await track.save();

  res.status(201).json({
    success: true,
    message: "Track created successfully",
    data: track,
  });
});

export const updateTrack = asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params;
  const updates = req.body;

  // Validate ObjectId format
  if (!isValidObjectId(id)) {
    return res.status(400).json({
      success: false,
      message: "Invalid track ID",
    });
  }

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
});

export const deleteTrack = asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params;

  // Validate ObjectId format
  if (!isValidObjectId(id)) {
    return res.status(400).json({
      success: false,
      message: "Invalid track ID",
    });
  }

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
});
