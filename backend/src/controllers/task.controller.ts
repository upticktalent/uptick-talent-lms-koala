import { Request, Response } from "express";
import { Task } from "../models/Task.model";
import { Cohort } from "../models/Cohort.model";
import { Track } from "../models/Track.model";
import { AuthRequest } from "../middleware/auth";
import { asyncHandler, isValidObjectId } from "../utils/mongooseErrorHandler";
import { User } from "../models/User.model";

// Get all tasks for a cohort and track
export const getTasks = asyncHandler(
  async (req: AuthRequest, res: Response) => {
    const {
      cohortId,
      trackId,
      page = 1,
      limit = 10,
      type,
      difficulty,
    } = req.query;

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

    if (difficulty) {
      filter.difficulty = difficulty;
    }

    const skip = (Number(page) - 1) * Number(limit);

    const tasks = await Task.find(filter)
      .populate("cohort", "name cohortNumber description")
      .populate("track", "name trackId description color")
      .populate("createdBy", "firstName lastName email role")
      .populate("submissions.student", "firstName lastName email")
      .populate("submissions.gradedBy", "firstName lastName")
      .sort({ dueDate: 1 })
      .skip(skip)
      .limit(Number(limit));

    const total = await Task.countDocuments(filter);

    res.status(200).json({
      success: true,
      message: "Tasks retrieved successfully",
      data: {
        tasks,
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

// Get task by ID
export const getTaskById = asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params;

  if (!isValidObjectId(id)) {
    return res.status(400).json({
      success: false,
      message: "Invalid task ID",
    });
  }

  const task = await Task.findById(id)
    .populate("cohort", "name cohortNumber description")
    .populate("track", "name trackId description color")
    .populate("createdBy", "firstName lastName email role")
    .populate("submissions.student", "firstName lastName email")
    .populate("submissions.gradedBy", "firstName lastName");

  if (!task) {
    return res.status(404).json({
      success: false,
      message: "Task not found",
    });
  }

  res.status(200).json({
    success: true,
    message: "Task retrieved successfully",
    data: task,
  });
});

// Create new task (mentor/admin only)
export const createTask = asyncHandler(
  async (req: AuthRequest, res: Response) => {
    const {
      cohortId,
      trackId,
      title,
      description,
      type,
      difficulty,
      estimatedHours,
      maxScore,
      dueDate,
      requirements = [],
      resources = [],
      allowLateSubmissions = true,
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

    const task = new Task({
      cohort: cohortId,
      track: trackId,
      title,
      description,
      type,
      difficulty,
      estimatedHours,
      maxScore,
      dueDate: new Date(dueDate),
      createdBy: req.user!.id,
      requirements,
      resources,
      allowLateSubmissions,
    });

    await task.save();

    const populatedTask = await Task.findById(task._id)
      .populate("cohort", "name cohortNumber description")
      .populate("track", "name trackId description color")
      .populate("createdBy", "firstName lastName email role");

    res.status(201).json({
      success: true,
      message: "Task created successfully",
      data: populatedTask,
    });
  },
);

// Update task (creator only)
export const updateTask = asyncHandler(
  async (req: AuthRequest, res: Response) => {
    const { id } = req.params;
    const updates = req.body;

    if (!isValidObjectId(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid task ID",
      });
    }

    const task = await Task.findById(id);

    if (!task) {
      return res.status(404).json({
        success: false,
        message: "Task not found",
      });
    }

    // Check if user is the creator or admin
    if (
      task.createdBy.toString() !== req.user!.id &&
      req.user!.role !== "admin"
    ) {
      return res.status(403).json({
        success: false,
        message: "Only the creator or admin can update this task",
      });
    }

    const updatedTask = await Task.findByIdAndUpdate(
      id,
      { ...updates, updatedAt: new Date() },
      { new: true, runValidators: true },
    )
      .populate("cohort", "name cohortNumber description")
      .populate("track", "name trackId description color")
      .populate("createdBy", "firstName lastName email role");

    res.status(200).json({
      success: true,
      message: "Task updated successfully",
      data: updatedTask,
    });
  },
);

// Delete task (creator only)
export const deleteTask = asyncHandler(
  async (req: AuthRequest, res: Response) => {
    const { id } = req.params;

    if (!isValidObjectId(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid task ID",
      });
    }

    const task = await Task.findById(id);

    if (!task) {
      return res.status(404).json({
        success: false,
        message: "Task not found",
      });
    }

    // Check if user is the creator or admin
    if (
      task.createdBy.toString() !== req.user!.id &&
      req.user!.role !== "admin"
    ) {
      return res.status(403).json({
        success: false,
        message: "Only the creator or admin can delete this task",
      });
    }

    await Task.findByIdAndDelete(id);

    res.status(200).json({
      success: true,
      message: "Task deleted successfully",
    });
  },
);

// Submit task (students only)
export const submitTask = asyncHandler(
  async (req: AuthRequest, res: Response) => {
    const { id } = req.params;
    const { content, attachments = [] } = req.body;

    if (!isValidObjectId(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid task ID",
      });
    }

    const task = await Task.findById(id);

    if (!task) {
      return res.status(404).json({
        success: false,
        message: "Task not found",
      });
    }

    // Check if user is a student
    if (req.user!.role !== "student") {
      return res.status(403).json({
        success: false,
        message: "Only students can submit tasks",
      });
    }

    // Check if student already has a submission
    const existingSubmissionIndex = task.submissions.findIndex(
      (sub) => sub.student.toString() === req.user!.id,
    );

    const isLate = new Date() > task.dueDate;

    if (!task.allowLateSubmissions && isLate) {
      return res.status(400).json({
        success: false,
        message: "Late submissions are not allowed for this task",
      });
    }

    const submissionData = {
      task: task._id,
      student: req.user!.id,
      content,
      attachments,
      status: "submitted" as const,
      maxScore: task.maxScore,
      submittedAt: new Date(),
      isLate,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    if (existingSubmissionIndex !== -1) {
      // Update existing submission
      task.submissions[existingSubmissionIndex] = {
        ...task.submissions[existingSubmissionIndex],
        ...submissionData,
      } as any;
    } else {
      // Add new submission
      task.submissions.push(submissionData as any);
    }

    await task.save();

    const updatedTask = await Task.findById(id)
      .populate("submissions.student", "firstName lastName email")
      .populate("submissions.gradedBy", "firstName lastName");

    res.status(200).json({
      success: true,
      message: "Task submitted successfully",
      data: updatedTask,
    });
  },
);

// Grade task submission (mentor/admin only)
export const gradeTaskSubmission = asyncHandler(
  async (req: AuthRequest, res: Response) => {
    const { id, submissionId } = req.params;
    const { score, feedback } = req.body;

    if (!isValidObjectId(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid task ID",
      });
    }

    const task = await Task.findById(id);

    if (!task) {
      return res.status(404).json({
        success: false,
        message: "Task not found",
      });
    }

    const submission = (task.submissions as any).id(submissionId);

    if (!submission) {
      return res.status(404).json({
        success: false,
        message: "Submission not found",
      });
    }

    // Validate score
    if (score < 0 || score > task.maxScore) {
      return res.status(400).json({
        success: false,
        message: `Score must be between 0 and ${task.maxScore}`,
      });
    }

    submission.score = score;
    submission.feedback = feedback;
    submission.gradedBy = req.user!.id as any;
    submission.gradedAt = new Date();
    submission.status = "graded";

    await task.save();

    const updatedTask = await Task.findById(id)
      .populate("submissions.student", "firstName lastName email")
      .populate("submissions.gradedBy", "firstName lastName");

    res.status(200).json({
      success: true,
      message: "Task graded successfully",
      data: updatedTask,
    });
  },
);

// Get task submissions for a task (mentor/admin only)
export const getTaskSubmissions = asyncHandler(
  async (req: AuthRequest, res: Response) => {
    const { id } = req.params;
    const { status, page = 1, limit = 20 } = req.query;

    if (!isValidObjectId(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid task ID",
      });
    }

    const task = await Task.findById(id)
      .populate("submissions.student", "firstName lastName email")
      .populate("submissions.gradedBy", "firstName lastName");

    if (!task) {
      return res.status(404).json({
        success: false,
        message: "Task not found",
      });
    }

    let submissions = task.submissions;

    // Filter by status if provided
    if (status) {
      submissions = submissions.filter((sub) => sub.status === status);
    }

    // Pagination
    const startIndex = (Number(page) - 1) * Number(limit);
    const endIndex = startIndex + Number(limit);
    const paginatedSubmissions = submissions.slice(startIndex, endIndex);

    res.status(200).json({
      success: true,
      message: "Task submissions retrieved successfully",
      data: {
        submissions: paginatedSubmissions,
        pagination: {
          total: submissions.length,
          page: Number(page),
          limit: Number(limit),
          pages: Math.ceil(submissions.length / Number(limit)),
        },
      },
    });
  },
);

// Get tasks for student dashboard
export const getStudentTasks = asyncHandler(
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

    const tasks = await Task.find({
      cohort: user.currentCohort,
      track: user.currentTrack,
      isPublished: true,
      $or: [{ dueDate: { $gte: new Date() } }, { allowLateSubmissions: true }],
    })
      .populate("cohort", "name cohortNumber")
      .populate("track", "name trackId")
      .populate("createdBy", "firstName lastName")
      .populate("submissions.student", "firstName lastName")
      .sort({ dueDate: 1 });

    // Filter submissions to show only the current user's submissions
    const tasksWithUserSubmissions = tasks.map((task) => ({
      ...task.toObject(),
      submissions: task.submissions.filter(
        (sub) => sub.student.toString() === userId,
      ),
    }));

    res.status(200).json({
      success: true,
      message: "Student tasks retrieved successfully",
      data: tasksWithUserSubmissions,
    });
  },
);

// Get tasks for mentor dashboard
export const getMentorTasks = asyncHandler(
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

    const tasks = await Task.find({
      track: { $in: user.assignedTracks },
    })
      .populate("cohort", "name cohortNumber")
      .populate("track", "name trackId")
      .populate("createdBy", "firstName lastName")
      .populate("submissions.student", "firstName lastName")
      .populate("submissions.gradedBy", "firstName lastName")
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      message: "Mentor tasks retrieved successfully",
      data: tasks,
    });
  },
);

// Get student's submissions across all tasks
export const getStudentSubmissions = asyncHandler(
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

    const tasks = await Task.find({
      cohort: user.currentCohort,
      track: user.currentTrack,
      "submissions.student": userId,
    })
      .populate("cohort", "name cohortNumber")
      .populate("track", "name trackId")
      .populate("createdBy", "firstName lastName")
      .populate("submissions.student", "firstName lastName")
      .populate("submissions.gradedBy", "firstName lastName");

    // Extract only the user's submissions with task info
    const userSubmissions: any[] = [];
    tasks.forEach((task) => {
      const userSubmission = task.submissions.find(
        (sub) => sub.student.toString() === userId,
      );
      if (userSubmission) {
        userSubmissions.push({
          ...JSON.parse(JSON.stringify(userSubmission)),
          task: {
            _id: task._id,
            title: task.title,
            description: task.description,
            type: task.type,
            maxScore: task.maxScore,
            dueDate: task.dueDate,
            cohort: task.cohort,
            track: task.track,
          },
        });
      }
    });

    res.status(200).json({
      success: true,
      message: "Student submissions retrieved successfully",
      data: userSubmissions,
    });
  },
);

// Get submissions to grade for mentor
export const getPendingGrading = asyncHandler(
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

    const tasks = await Task.find({
      track: { $in: user.assignedTracks },
      "submissions.status": "submitted",
    })
      .populate("cohort", "name cohortNumber")
      .populate("track", "name trackId")
      .populate("createdBy", "firstName lastName")
      .populate("submissions.student", "firstName lastName");

    // Extract pending submissions with task info
    const pendingSubmissions: any[] = [];
    tasks.forEach((task) => {
      const submittedSubmissions = task.submissions.filter(
        (sub) => sub.status === "submitted",
      );
      submittedSubmissions.forEach((submission) => {
        pendingSubmissions.push({
          ...JSON.parse(JSON.stringify(submission)),
          task: {
            _id: task._id,
            title: task.title,
            description: task.description,
            type: task.type,
            maxScore: task.maxScore,
            dueDate: task.dueDate,
            cohort: task.cohort,
            track: task.track,
          },
        });
      });
    });

    // Sort by submission date (oldest first)
    pendingSubmissions.sort(
      (a: any, b: any) =>
        new Date(a.submittedAt).getTime() - new Date(b.submittedAt).getTime(),
    );

    res.status(200).json({
      success: true,
      message: "Pending submissions retrieved successfully",
      data: pendingSubmissions,
    });
  },
);

// Upload task resources (mentor/admin only)
export const uploadTaskResource = asyncHandler(
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
          isRequired: req.body.isRequired === 'true' || false, // From form data
        };
      });

      res.status(200).json({
        success: true,
        message: `${files.length} resource(s) uploaded successfully`,
        data: uploadedFiles.length === 1 ? uploadedFiles[0] : uploadedFiles,
      });
    } catch (error) {
      console.error("Error uploading task resource:", error);
      res.status(500).json({
        success: false,
        message: "Failed to upload resource",
      });
    }
  },
);

// Return submission for revision (mentor/admin only)
export const returnSubmissionForRevision = asyncHandler(
  async (req: AuthRequest, res: Response) => {
    const { id, submissionId } = req.params;
    const { feedback } = req.body;

    if (!isValidObjectId(id) || !isValidObjectId(submissionId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid task or submission ID",
      });
    }

    const task = await Task.findById(id);

    if (!task) {
      return res.status(404).json({
        success: false,
        message: "Task not found",
      });
    }

    const submission = (task.submissions as any).id(submissionId);

    if (!submission) {
      return res.status(404).json({
        success: false,
        message: "Submission not found",
      });
    }

    // Update submission status and feedback
    submission.status = "revision_requested";
    submission.feedback = feedback;
    submission.gradedBy = req.user!.id;
    submission.gradedAt = new Date();

    await task.save();

    const updatedTask = await Task.findById(id)
      .populate("submissions.student", "firstName lastName email")
      .populate("submissions.gradedBy", "firstName lastName");

    res.status(200).json({
      success: true,
      message: "Submission returned for revision",
      data: updatedTask,
    });
  },
);
