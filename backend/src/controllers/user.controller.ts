import { Request, Response } from "express";
import { User } from "../models/User";
import { Track } from "../models/Track";
import { hashPassword, generatePassword } from "../utils/auth";
import { emailService } from "../services/email.service";
import { AuthRequest } from "../middleware/auth";

export const getUsers = async (req: AuthRequest, res: Response) => {
  try {
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
  } catch (error) {
    console.error("Get users error:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

export const getMentors = async (req: Request, res: Response) => {
  try {
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
  } catch (error) {
    console.error("Get mentors error:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

export const getUserDetails = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

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
  } catch (error) {
    console.error("Get user details error:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

export const createUser = async (req: AuthRequest, res: Response) => {
  try {
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
  } catch (error) {
    console.error("Create user error:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

export const updateUser = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const updates = req.body;

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
  } catch (error) {
    console.error("Update user error:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

export const toggleUserStatus = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

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
  } catch (error) {
    console.error("Toggle user status error:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

export const assignTracksToMentor = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { trackIds } = req.body;

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
  } catch (error) {
    console.error("Assign tracks error:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

export const deleteUser = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

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
  } catch (error) {
    console.error("Delete user error:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};
