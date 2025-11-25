import { Request, Response } from "express";
import { User } from "../models/User.model";
import { Track } from "../models/Track.model";
import { hashPassword, generatePassword } from "../utils/auth";
import { brevoEmailService } from "../services/brevoEmail.service";
import { AuthRequest } from "../middleware/auth";
import { asyncHandler, isValidObjectId } from "../utils/mongooseErrorHandler";

export const getUsers = asyncHandler(
  async (req: AuthRequest, res: Response) => {
    const { role, isActive, page = 1, limit = 10 } = req.query;

    // Build filter query
    const filter: any = {};

    if (role) {
      // Handle multiple roles separated by comma
      const roles = (role as string).split(",").map((r) => r.trim());
      if (roles.length > 1) {
        filter.role = { $in: roles };
      } else {
        filter.role = role;
      }
    }

    if (isActive !== undefined) {
      filter.isActive = isActive === "true";
    }

    const skip = (Number(page) - 1) * Number(limit);

    const users = await User.find(filter)
      .populate("trackAssignments.track", "name trackId")
      .populate("trackAssignments.cohort", "name cohortNumber")
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

// Get all users without pagination (for dropdowns and selects)
export const getAllUsers = asyncHandler(
  async (req: AuthRequest, res: Response) => {
    const { role, isActive } = req.query;

    // Build filter query
    const filter: any = {};
    const isRoleArray = Array.isArray(role);
    if (role) {
      // Handle multiple roles separated by comma
      const roles = isRoleArray
        ? role
        : (role as string).split(",").map((r) => r.trim());
      if (roles.length > 1) {
        filter.role = { $in: roles };
      } else {
        filter.role = role;
      }
    }

    if (isActive !== undefined) {
      filter.isActive = isActive === "true";
    }

    const users = await User.find(filter)
      .select(
        "firstName lastName email role assignedTracks isActive state country lastLogin",
      )
      .populate("assignedTracks", "name trackId")
      .sort({ firstName: 1, lastName: 1 });

    res.status(200).json({
      success: true,
      message: "All users retrieved successfully",
      data: {
        users,
        total: users.length,
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
      // Note: For mentors, track assignments should be done via cohort-track assignment endpoints
      trackAssignments: [],
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

    await brevoEmailService.sendWelcomeEmail(
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
    const { trackIds, cohortIds } = req.body;

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

    // Update both legacy and new fields for backward compatibility
    mentor.assignedTracks = trackIds;

    // Create track assignments - if cohortIds provided, create specific assignments
    // Otherwise create general assignments (mentor can access track in any cohort)
    const trackAssignments = trackIds.map((trackId: any) => ({
      cohort: cohortIds && cohortIds.length > 0 ? cohortIds[0] : null, // For simplicity, assign to first cohort if provided
      track: trackId,
      role: "mentor" as const,
      assignedAt: new Date(),
      isActive: true,
    }));

    (mentor as any).trackAssignments = trackAssignments;
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

// Student-specific endpoints

// Get all students with filtering options
export const getStudents = asyncHandler(async (req: Request, res: Response) => {
  const { cohortId, trackId, page = 1, limit = 10 } = req.query;

  // Build filter query for students only
  const filter: any = { role: "student" };

  // Handle cohort/track filtering with new trackAssignments structure
  if (cohortId || trackId) {
    const assignmentFilter: any = {};
    if (cohortId) assignmentFilter["trackAssignments.cohort"] = cohortId;
    if (trackId) assignmentFilter["trackAssignments.track"] = trackId;
    Object.assign(filter, assignmentFilter);
  }

  const skip = (Number(page) - 1) * Number(limit);

  const students = await User.find(filter)
    .populate("trackAssignments.track", "name trackId description color")
    .populate("trackAssignments.cohort", "name cohortNumber")
    .populate("assignedTracks", "name trackId")
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(Number(limit));

  const total = await User.countDocuments(filter);

  res.status(200).json({
    success: true,
    message: "Students retrieved successfully",
    data: {
      students,
      pagination: {
        total,
        page: Number(page),
        limit: Number(limit),
        pages: Math.ceil(total / Number(limit)),
      },
    },
  });
});

// Get student details by ID
export const getStudentDetails = asyncHandler(
  async (req: Request, res: Response) => {
    const { id } = req.params;

    if (!isValidObjectId(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid student ID",
      });
    }

    const student = await User.findOne({ _id: id, role: "student" })
      .populate("currentTrack", "name trackId description color")
      .populate("assignedTracks", "name trackId")
      .populate("createdBy", "firstName lastName email");

    if (!student) {
      return res.status(404).json({
        success: false,
        message: "Student not found",
      });
    }

    res.status(200).json({
      success: true,
      message: "Student details retrieved successfully",
      data: student,
    });
  },
);

// Assign track to student (cohort-centric)
export const assignTrackToStudent = asyncHandler(
  async (req: Request, res: Response) => {
    const { id } = req.params;
    const { trackId, cohortId } = req.body;

    if (!isValidObjectId(id) || !isValidObjectId(trackId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid student or track ID",
      });
    }

    // Validate track exists
    const track = await Track.findById(trackId);
    if (!track) {
      return res.status(404).json({
        success: false,
        message: "Track not found",
      });
    }

    // Find or create track assignment
    const student = await User.findById(id);
    if (!student) {
      return res.status(404).json({
        success: false,
        message: "Student not found",
      });
    }

    const existingAssignment = ((student.trackAssignments as any[]) || []).find(
      (assignment: any) =>
        assignment.track.toString() === trackId &&
        assignment.cohort.toString() === cohortId,
    );

    if (!existingAssignment) {
      (student.trackAssignments as any[]).push({
        cohort: cohortId,
        track: trackId,
        role: "student",
        assignedAt: new Date(),
        isActive: true,
      });
      await student.save();
    }

    await student.populate([
      {
        path: "trackAssignments.track",
        select: "name trackId description color",
      },
      { path: "trackAssignments.cohort", select: "name cohortNumber" },
    ]);

    if (!student) {
      return res.status(404).json({
        success: false,
        message: "Student not found",
      });
    }

    res.status(200).json({
      success: true,
      message: "Track assigned to student successfully",
      data: student,
    });
  },
);

// Get students by cohort
export const getStudentsByCohort = asyncHandler(
  async (req: Request, res: Response) => {
    const { cohortId } = req.params;
    const { page = 1, limit = 10, trackId } = req.query;

    // Validate ObjectId format
    if (!isValidObjectId(cohortId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid cohort ID",
      });
    }

    const filter: any = { role: "student", assignedCohort: cohortId };

    if (trackId) {
      if (!isValidObjectId(trackId as string)) {
        return res.status(400).json({
          success: false,
          message: "Invalid track ID",
        });
      }
      filter.assignedTracks = trackId;
    }

    const skip = (Number(page) - 1) * Number(limit);

    const students = await User.find(filter)
      .populate("assignedTracks", "name trackId")
      .populate("assignedCohort", "name cohortNumber")
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(Number(limit));

    const total = await User.countDocuments(filter);

    res.status(200).json({
      success: true,
      message: "Students retrieved successfully",
      data: {
        students,
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

// Reset user password (admin only)
export const resetUserPassword = asyncHandler(
  async (req: AuthRequest, res: Response) => {
    const { id } = req.params;
    const adminId = req.user._id;

    // Validate ObjectId format
    if (!isValidObjectId(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid user ID",
      });
    }

    // Find the user
    const user = await User.findById(id);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    // Generate new password
    const newPassword = generatePassword();
    const hashedPassword = await hashPassword(newPassword);

    // Update user password
    user.password = hashedPassword;
    user.isPasswordDefault = true;
    await user.save();

    // Send password reset email
    await brevoEmailService.sendPasswordResetEmail(
      user.email,
      `${user.firstName} ${user.lastName}`,
      newPassword,
    );

    res.status(200).json({
      success: true,
      message: "Password reset successfully",
      data: {
        generatedPassword: newPassword, // Include in response for admin
      },
    });
  },
);
