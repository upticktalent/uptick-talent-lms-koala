import { Request, Response } from "express";
import { Material } from "../models/Material.model";
import { Cohort } from "../models/Cohort.model";
import { Track } from "../models/Track.model";
import { User } from "../models/User.model";
import { AuthRequest } from "../middleware/auth";
import { asyncHandler, isValidObjectId } from "../utils/mongooseErrorHandler";

// Get all materials for a cohort and track
export const getMaterials = asyncHandler(
  async (req: AuthRequest, res: Response) => {
    const {
      trackId,
      cohortId,
      type,
      category,
      difficulty,
      isRequired,
      isPublished,
      page = 1,
      limit = 10,
    } = req.query;

    const filter: any = {};

    // Cohort filtering (required for cohort-centric approach)
    if (cohortId && isValidObjectId(cohortId as string)) {
      filter.cohort = cohortId;
    }

    // Track filtering
    if (trackId && isValidObjectId(trackId as string)) {
      filter.track = trackId;
    }

    // If cohort is provided, ensure track belongs to that cohort
    if (cohortId && trackId) {
      const cohort = await Cohort.findById(cohortId);
      if (cohort && !cohort.hasTrack(trackId as string)) {
        return res.status(400).json({
          success: false,
          message: "Track does not belong to the specified cohort",
        });
      }
    }

    const skip = (Number(page) - 1) * Number(limit);

    const materials = await Material.find(filter)
      .populate("cohort", "name cohortNumber description")
      .populate("track", "name trackId description color")
      .populate("createdBy", "firstName lastName email role")
      .sort({ order: 1, createdAt: -1 })
      .skip(skip)
      .limit(Number(limit));

    const total = await Material.countDocuments(filter);

    res.status(200).json({
      success: true,
      message: "Materials retrieved successfully",
      data: {
        materials,
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

// Get material by ID
export const getMaterialById = asyncHandler(
  async (req: Request, res: Response) => {
    const { id } = req.params;

    if (!isValidObjectId(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid material ID",
      });
    }

    const material = await Material.findById(id)
      .populate("cohort", "name cohortNumber description")
      .populate("track", "name trackId description color")
      .populate("createdBy", "firstName lastName email role");

    if (!material) {
      return res.status(404).json({
        success: false,
        message: "Material not found",
      });
    }

    // Increment access count
    material.accessCount += 1;
    await material.save();

    res.status(200).json({
      success: true,
      message: "Material retrieved successfully",
      data: material,
    });
  },
);

// Create new material (mentor/admin only)
export const createMaterial = asyncHandler(
  async (req: AuthRequest, res: Response) => {
    const {
      cohortId,
      trackId,
      title,
      description,
      type,
      url,
      category = "resource",
      difficulty = "beginner",
      estimatedReadTime,
      isRequired = false,
      isPublished = false,
      order = 0,
      tags = [],
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

    const material = new Material({
      cohort: cohortId,
      track: trackId,
      title,
      description,
      type,
      url,
      category,
      difficulty,
      estimatedReadTime,
      isRequired,
      isPublished,
      order,
      tags,
      createdBy: req.user!.userId,
    });

    await material.save();

    const populatedMaterial = await Material.findById(material._id)
      .populate("cohort", "name cohortNumber description")
      .populate("track", "name trackId description color")
      .populate("createdBy", "firstName lastName email role");

    res.status(201).json({
      success: true,
      message: "Material created successfully",
      data: populatedMaterial,
    });
  },
);

// Update material (creator only)
export const updateMaterial = asyncHandler(
  async (req: AuthRequest, res: Response) => {
    const { id } = req.params;
    const updates = req.body;

    if (!isValidObjectId(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid material ID",
      });
    }

    const material = await Material.findById(id);

    if (!material) {
      return res.status(404).json({
        success: false,
        message: "Material not found",
      });
    }

    // Check if user is the creator or admin
    if (
      material.createdBy.toString() !== req.user!.id &&
      req.user!.role !== "admin"
    ) {
      return res.status(403).json({
        success: false,
        message: "Only the creator or admin can update this material",
      });
    }

    const updatedMaterial = await Material.findByIdAndUpdate(
      id,
      { ...updates, updatedAt: new Date() },
      { new: true, runValidators: true },
    )
      .populate("cohort", "name cohortNumber description")
      .populate("track", "name trackId description color")
      .populate("createdBy", "firstName lastName email role");

    res.status(200).json({
      success: true,
      message: "Material updated successfully",
      data: updatedMaterial,
    });
  },
);

// Delete material (creator only)
export const deleteMaterial = asyncHandler(
  async (req: AuthRequest, res: Response) => {
    const { id } = req.params;

    if (!isValidObjectId(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid material ID",
      });
    }

    const material = await Material.findById(id);

    if (!material) {
      return res.status(404).json({
        success: false,
        message: "Material not found",
      });
    }

    // Check if user is the creator or admin
    if (
      material.createdBy.toString() !== req.user!.id &&
      req.user!.role !== "admin"
    ) {
      return res.status(403).json({
        success: false,
        message: "Only the creator or admin can delete this material",
      });
    }

    await Material.findByIdAndDelete(id);

    res.status(200).json({
      success: true,
      message: "Material deleted successfully",
    });
  },
);

// Get materials for student dashboard
export const getStudentMaterials = asyncHandler(
  async (req: AuthRequest, res: Response) => {
    const userId = req.user!.id;

    // Get user's current cohort and track
    const user = await User.findById(req.user._id).select("trackAssignments");

    if (!user || !user.trackAssignments || user.trackAssignments.length === 0) {
      return res.status(400).json({
        success: false,
        message: "User is not enrolled in any track",
      });
    }

    // Use the first active track assignment
    const activeAssignment = (user.trackAssignments as any[]).find(
      (assignment: any) => assignment.isActive,
    );
    if (!activeAssignment) {
      return res.status(400).json({
        success: false,
        message: "User has no active track assignment",
      });
    }

    const materials = await Material.find({
      track: activeAssignment.track,
      isPublished: true,
    })
      .populate("cohort", "name cohortNumber")
      .populate("track", "name trackId")
      .populate("createdBy", "firstName lastName")
      .sort({ order: 1, createdAt: -1 });

    res.status(200).json({
      success: true,
      message: "Student materials retrieved successfully",
      data: materials,
    });
  },
);

// Get materials for mentor dashboard
export const getMentorMaterials = asyncHandler(
  async (req: AuthRequest, res: Response) => {
    const userId = req.user!.id;

    // Get user's assigned tracks
    const user = await User.findById(userId).select("trackAssignments");

    if (!user || !user.trackAssignments || user.trackAssignments.length === 0) {
      return res.status(400).json({
        success: false,
        message: "Mentor is not assigned to any tracks",
      });
    }

    const mentorTrackIds = (user.trackAssignments as any[])
      .filter(
        (assignment: any) =>
          assignment.role === "mentor" && assignment.isActive,
      )
      .map((assignment: any) => assignment.track);

    const materials = await Material.find({
      track: { $in: mentorTrackIds },
    })
      .populate("cohort", "name cohortNumber")
      .populate("track", "name trackId")
      .populate("createdBy", "firstName lastName")
      .sort({ order: 1, createdAt: -1 });

    res.status(200).json({
      success: true,
      message: "Mentor materials retrieved successfully",
      data: materials,
    });
  },
);

// Get materials by category
export const getMaterialsByCategory = asyncHandler(
  async (req: AuthRequest, res: Response) => {
    const { category } = req.params;
    const { cohortId, trackId } = req.query;

    const filter: any = {
      category,
      isPublished: true,
    };

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

    const materials = await Material.find(filter)
      .populate("cohort", "name cohortNumber")
      .populate("track", "name trackId")
      .populate("createdBy", "firstName lastName")
      .sort({ order: 1, createdAt: -1 });

    res.status(200).json({
      success: true,
      message: `Materials in ${category} category retrieved successfully`,
      data: materials,
    });
  },
);

// Get required materials
export const getRequiredMaterials = asyncHandler(
  async (req: AuthRequest, res: Response) => {
    const { cohortId, trackId } = req.query;

    const filter: any = {
      isRequired: true,
      isPublished: true,
    };

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

    const materials = await Material.find(filter)
      .populate("cohort", "name cohortNumber")
      .populate("track", "name trackId")
      .populate("createdBy", "firstName lastName")
      .sort({ order: 1, createdAt: -1 });

    res.status(200).json({
      success: true,
      message: "Required materials retrieved successfully",
      data: materials,
    });
  },
);

// Track access to material (for analytics)
export const trackMaterialAccess = asyncHandler(
  async (req: AuthRequest, res: Response) => {
    const { id } = req.params;

    if (!isValidObjectId(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid material ID",
      });
    }

    const material = await Material.findByIdAndUpdate(
      id,
      { $inc: { accessCount: 1 } },
      { new: true },
    )
      .populate("cohort", "name cohortNumber")
      .populate("track", "name trackId")
      .populate("createdBy", "firstName lastName");

    if (!material) {
      return res.status(404).json({
        success: false,
        message: "Material not found",
      });
    }

    res.status(200).json({
      success: true,
      message: "Material access tracked successfully",
      data: material,
    });
  },
);

// Upload material file (mentor/admin only)
export const uploadMaterialFile = asyncHandler(
  async (req: AuthRequest, res: Response) => {
    // This would typically integrate with a file upload service like AWS S3, Cloudinary, etc.
    // For now, return a mock response

    res.status(200).json({
      success: true,
      message: "Material file uploaded successfully",
      data: {
        url: "https://example.com/uploaded-material.pdf",
        title: "Uploaded Material",
        type: "file",
        size: 1536000,
      },
    });
  },
);

// Get material analytics (mentor/admin only)
export const getMaterialAnalytics = asyncHandler(
  async (req: AuthRequest, res: Response) => {
    const { id } = req.params;

    if (!isValidObjectId(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid material ID",
      });
    }

    const material = await Material.findById(id);

    if (!material) {
      return res.status(404).json({
        success: false,
        message: "Material not found",
      });
    }

    // Calculate analytics
    const analytics = {
      totalAccess: material.accessCount,
      isRequired: material.isRequired,
      difficulty: material.difficulty,
      category: material.category,
      type: material.type,
      estimatedReadTime: material.estimatedReadTime,
      tags: material.tags,
      createdAt: material.createdAt,
      lastUpdated: material.updatedAt,
      engagementScore:
        Math.min((material.accessCount / 10) * 100, 100).toFixed(1) + "%", // Mock engagement score
    };

    res.status(200).json({
      success: true,
      message: "Material analytics retrieved successfully",
      data: analytics,
    });
  },
);
