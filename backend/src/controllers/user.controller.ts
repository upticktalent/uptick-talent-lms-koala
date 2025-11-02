import { Request, Response } from "express";
import { User } from "../models/User";
import { Track } from "../models/Track";
import { hashPassword, generatePassword } from "../utils/auth";
import { emailService } from "../services/email.service";
import { AuthRequest } from "../middleware/auth";
import { asyncHandler, isValidObjectId } from "../utils/mongooseErrorHandler";

export const getUsers = asyncHandler(
  async (req: AuthRequest, res: Response) => {
    const { role, isActive, page = 1, limit = 10 } = req.query;

    // Build filter query
    const filter: any = {};

    if (role) {
      filter.role = role;
    }

    if (isActive !== undefined) {
      filter.isActive = isActive === "true";
    }

    const skip = (Number(page) - 1) * Number(limit);

    const users = await User.find(filter)
      .populate("assignedTracks", "name trackId")
      .populate("createdBy", "firstName lastName email")
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(Number(limit));

    const total = await User.countDocuments(filter);

    res.status(200).json({
      success: true,
      message: "Users retrieved successfully",
      data: {
        users,
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

export const getMentors = asyncHandler(async (req: Request, res: Response) => {
  const mentors = await User.find({
    role: "mentor",
    isActive: true,
  })
    .populate("assignedTracks", "name trackId")
    .sort({ firstName: 1 });

  res.status(200).json({
    success: true,
    message: "Mentors retrieved successfully",
    data: mentors,
  });
});

export const getUserDetails = asyncHandler(
  async (req: Request, res: Response) => {
    const { id } = req.params;

    // Validate ObjectId format
    if (!isValidObjectId(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid user ID",
      });
    }

    const user = await User.findById(id)
      .populate("assignedTracks", "name trackId description")
      .populate("createdBy", "firstName lastName email");

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    res.status(200).json({
      success: true,
      message: "User details retrieved successfully",
      data: user,
    });
  },
);

export const createUser = asyncHandler(
  async (req: AuthRequest, res: Response) => {
    const {
      firstName,
      lastName,
      email,
      phoneNumber,
      gender,
      country,
      state,
      role,
      assignedTracks = [],
    } = req.body;

    const adminId = req.user._id;

    // Check if user already exists
    const existingUser = await User.findOne({ email: email.toLowerCase() });
    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: "User with this email already exists",
      });
    }

    // Validate assigned tracks if provided
    if (assignedTracks.length > 0) {
      const validTracks = await Track.find({ _id: { $in: assignedTracks } });
      if (validTracks.length !== assignedTracks.length) {
        return res.status(400).json({
          success: false,
          message: "One or more assigned tracks are invalid",
        });
      }
    }

    // Generate default password
    const defaultPassword = generatePassword();
    const hashedPassword = await hashPassword(defaultPassword);

    // Create new user
    const newUser = new User({
      firstName: firstName.trim(),
      lastName: lastName.trim(),
      email: email.toLowerCase().trim(),
      phoneNumber: phoneNumber.trim(),
      gender,
      country: country.trim(),
      state: state.trim(),
      password: hashedPassword,
      role,
      assignedTracks: role === "mentor" ? assignedTracks : [],
      isPasswordDefault: true,
      createdBy: adminId,
    });

    await newUser.save();
    await newUser.populate("assignedTracks", "name trackId");

    // Send welcome email with credentials
    const trackNames =
      role === "mentor" && assignedTracks.length > 0
        ? (await Track.find({ _id: { $in: assignedTracks } }))
            .map((t) => t.name)
            .join(", ")
        : "";

    await emailService.sendWelcomeEmail(
      newUser.email,
      `${newUser.firstName} ${newUser.lastName}`,
      role,
      defaultPassword,
      trackNames,
    );

    res.status(201).json({
      success: true,
      message: `${role.charAt(0).toUpperCase() + role.slice(1)} created successfully`,
      data: newUser,
    });
  },
);

export const updateUser = asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params;
  const updates = req.body;

  // Validate ObjectId format
  if (!isValidObjectId(id)) {
    return res.status(400).json({
      success: false,
      message: "Invalid user ID",
    });
  }

  // Validate assigned tracks if provided
  if (updates.assignedTracks) {
    const validTracks = await Track.find({
      _id: { $in: updates.assignedTracks },
    });
    if (validTracks.length !== updates.assignedTracks.length) {
      return res.status(400).json({
        success: false,
        message: "One or more assigned tracks are invalid",
      });
    }
  }

  const user = await User.findByIdAndUpdate(
    id,
    { ...updates, updatedAt: new Date() },
    { new: true, runValidators: true },
  ).populate("assignedTracks", "name trackId");

  if (!user) {
    return res.status(404).json({
      success: false,
      message: "User not found",
    });
  }

  res.status(200).json({
    success: true,
    message: "User updated successfully",
    data: user,
  });
});

export const toggleUserStatus = asyncHandler(
  async (req: Request, res: Response) => {
    const { id } = req.params;

    // Validate ObjectId format
    if (!isValidObjectId(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid user ID",
      });
    }

    const user = await User.findById(id);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    user.isActive = !user.isActive;
    await user.save();

    res.status(200).json({
      success: true,
      message: `User ${user.isActive ? "activated" : "deactivated"} successfully`,
      data: { isActive: user.isActive },
    });
  },
);

export const assignTracksToMentor = asyncHandler(
  async (req: Request, res: Response) => {
    const { id } = req.params;
    const { trackIds } = req.body;

    // Validate ObjectId format
    if (!isValidObjectId(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid user ID",
      });
    }

    const mentor = await User.findById(id);
    if (!mentor) {
      return res.status(404).json({
        success: false,
        message: "Mentor not found",
      });
    }

    if (mentor.role !== "mentor") {
      return res.status(400).json({
        success: false,
        message: "User is not a mentor",
      });
    }

    // Validate tracks
    const validTracks = await Track.find({ _id: { $in: trackIds } });
    if (validTracks.length !== trackIds.length) {
      return res.status(400).json({
        success: false,
        message: "One or more tracks are invalid",
      });
    }

    mentor.assignedTracks = trackIds;
    await mentor.save();
    await mentor.populate("assignedTracks", "name trackId");

    res.status(200).json({
      success: true,
      message: "Tracks assigned to mentor successfully",
      data: mentor,
    });
  },
);

export const deleteUser = asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params;

  // Validate ObjectId format
  if (!isValidObjectId(id)) {
    return res.status(400).json({
      success: false,
      message: "Invalid user ID",
    });
  }

  const user = await User.findByIdAndDelete(id);

  if (!user) {
    return res.status(404).json({
      success: false,
      message: "User not found",
    });
  }

  res.status(200).json({
    success: true,
    message: "User deleted successfully",
  });
});
