import { Request, Response } from "express";
import { Task, Submission, ITask } from "../models/Task.model";
import { Cohort } from "../models/Cohort.model";
import { User } from "../models/User.model";
import { AuthRequest } from "../middleware/auth";
import { asyncHandler, isValidObjectId } from "../utils/mongooseErrorHandler";

// Create a new task
export const createTask = asyncHandler(
  async (req: AuthRequest, res: Response) => {
    const {
      cohortId,
      trackId,
      title,
      description,
      instructions,
      dueDate,
      maxScore,
      attachments,
      isPublished,
    } = req.body;
    const user = req.user!;

    // Validate required fields
    if (!cohortId || !trackId || !title || !description) {
      return res.status(400).json({
        success: false,
        message: "Cohort ID, Track ID, title, and description are required",
      });
    }

    // Validate IDs
    if (!isValidObjectId(cohortId) || !isValidObjectId(trackId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid cohort or track ID",
      });
    }

    // Check user permissions
    if (user.role === "mentor") {
      const hasAccess = user.hasAccessToTrack(cohortId, trackId);
      if (!hasAccess) {
        return res.status(403).json({
          success: false,
          message: "You don't have permission to create tasks for this track",
        });
      }
    } else if (user.role !== "admin") {
      return res.status(403).json({
        success: false,
        message: "Only admins and mentors can create tasks",
      });
    }

    // Validate cohort and track exist
    const cohort = await Cohort.findById(cohortId);
    if (!cohort) {
      return res.status(404).json({
        success: false,
        message: "Cohort not found",
      });
    }

    const trackExists = cohort.hasTrack(trackId);
    if (!trackExists) {
      return res.status(400).json({
        success: false,
        message: "Track not found in this cohort",
      });
    }

    // Create the task
    const task: ITask = new Task({
      title,
      description,
      instructions,
      cohort: cohortId,
      track: trackId,
      dueDate,
      maxScore,
      materials: attachments || [],
      createdBy: req.user._id,
    });

    await task.save();

    const populatedTask = await Task.findById(task._id)
      .populate("createdBy", "firstName lastName email role")
      .populate("track", "name trackId")
      .populate("cohort", "name cohortNumber");

    res.status(201).json({
      success: true,
      message: "Task created successfully",
      data: populatedTask,
    });
  },
);

// Get tasks for a cohort/track
export const getTasks = asyncHandler(
  async (req: AuthRequest, res: Response) => {
    const { cohortId, trackId } = req.params;
    const { page = 1, limit = 10, isPublished } = req.query;
    const user = req.user!;

    // Validate IDs
    if (!isValidObjectId(cohortId) || !isValidObjectId(trackId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid cohort or track ID",
      });
    }

    // Check permissions
    if (user.role === "student") {
      if (
        user.studentCohort?.toString() !== cohortId ||
        user.studentTrack?.toString() !== trackId
      ) {
        return res.status(403).json({
          success: false,
          message: "Access denied",
        });
      }
    } else if (user.role === "mentor") {
      const hasAccess = user.hasAccessToTrack(cohortId, trackId);
      if (!hasAccess) {
        return res.status(403).json({
          success: false,
          message: "Access denied to this track",
        });
      }
    }

    // Build filter
    const filter: any = { cohort: cohortId, track: trackId };

    // Students only see published tasks
    if (user.role === "student") {
      filter.isPublished = true;
    } else if (isPublished !== undefined) {
      filter.isPublished = isPublished === "true";
    }

    const skip = (Number(page) - 1) * Number(limit);

    const tasks = await Task.find(filter)
      .populate("createdBy", "firstName lastName email role")
      .populate("track", "name trackId")
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(Number(limit));

    const total = await Task.countDocuments(filter);

    // For students, also get their submission status for each task
    let tasksWithSubmissions: any[] = [];
    if (user.role === "student") {
      const taskIds = tasks.map((task) => task._id);
      const submissions = await Submission.find({
        task: { $in: taskIds },
        student: user._id,
      });

      tasksWithSubmissions = tasks.map((task) => {
        const submission = submissions.find(
          (sub) => sub.task.toString() === task._id.toString(),
        );
        return {
          ...task.toObject(),
          submission: submission
            ? {
                _id: submission._id,
                submittedAt: submission.submittedAt,
                status: submission.status,
                score: submission.score,
              }
            : null,
        };
      });
    } else {
      tasksWithSubmissions = tasks.map((task) => task.toObject());
    }

    res.status(200).json({
      success: true,
      message: "Tasks retrieved successfully",
      data: {
        tasks: tasksWithSubmissions,
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

// Get single task details
export const getTaskDetails = asyncHandler(
  async (req: AuthRequest, res: Response) => {
    const { id } = req.params;
    const user = req.user!;

    if (!isValidObjectId(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid task ID",
      });
    }

    const task = await Task.findById(id)
      .populate("createdBy", "firstName lastName email role")
      .populate("track", "name trackId")
      .populate("cohort", "name cohortNumber");

    if (!task) {
      return res.status(404).json({
        success: false,
        message: "Task not found",
      });
    }

    // Check permissions
    if (user.role === "student") {
      if (
        user.studentCohort?.toString() !== task.cohort._id.toString() ||
        user.studentTrack?.toString() !== task.track._id.toString()
      ) {
        return res.status(403).json({
          success: false,
          message: "Access denied",
        });
      }

      // Students can only see published tasks
      if (!task.isPublished) {
        return res.status(404).json({
          success: false,
          message: "Task not found",
        });
      }
    } else if (user.role === "mentor") {
      const hasAccess = user.hasAccessToTrack(
        task.cohort._id.toString(),
        task.track._id.toString(),
      );
      if (!hasAccess) {
        return res.status(403).json({
          success: false,
          message: "Access denied",
        });
      }
    }

    // If student, also get their submission
    let submission = null;
    if (user.role === "student") {
      submission = await Submission.findOne({
        task: task._id,
        student: user._id,
      });
    }

    res.status(200).json({
      success: true,
      message: "Task retrieved successfully",
      data: {
        ...task.toObject(),
        submission,
      },
    });
  },
);

// Submit assignment (for students)
export const submitTask = asyncHandler(
  async (req: AuthRequest, res: Response) => {
    const { id } = req.params;
    const { submissionText, attachments } = req.body;
    const user = req.user!;

    if (user.role !== "student") {
      return res.status(403).json({
        success: false,
        message: "Only students can submit tasks",
      });
    }

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

    // Check if task is published
    if (!task.isPublished) {
      return res.status(400).json({
        success: false,
        message: "Task is not published yet",
      });
    }

    // Check if task belongs to student's cohort and track
    if (
      user.studentCohort?.toString() !== task.cohort.toString() ||
      user.studentTrack?.toString() !== task.track.toString()
    ) {
      return res.status(403).json({
        success: false,
        message: "Access denied",
      });
    }

    // Check if due date has passed
    if (task.dueDate && new Date() > task.dueDate) {
      return res.status(400).json({
        success: false,
        message: "Submission deadline has passed",
      });
    }

    // Check if submission already exists
    const existingSubmission = await Submission.findOne({
      task: task._id,
      student: user._id,
    });

    if (existingSubmission) {
      return res.status(400).json({
        success: false,
        message: "You have already submitted this task",
      });
    }

    const submission = new Submission({
      task: task._id,
      student: user._id,
      submissionText: submissionText?.trim(),
      attachments: attachments || [],
      status: "submitted",
    });

    await submission.save();

    const populatedSubmission = await Submission.findById(submission._id)
      .populate("task", "title maxScore")
      .populate("student", "firstName lastName email");

    res.status(201).json({
      success: true,
      message: "Task submitted successfully",
      data: populatedSubmission,
    });
  },
);

// Grade a submission (for mentors and admins)
export const gradeSubmission = asyncHandler(
  async (req: AuthRequest, res: Response) => {
    const { id } = req.params;
    const { score, feedback } = req.body;
    const user = req.user!;

    if (user.role === "student") {
      return res.status(403).json({
        success: false,
        message: "Students cannot grade submissions",
      });
    }

    if (!isValidObjectId(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid submission ID",
      });
    }

    const submission = await Submission.findById(id)
      .populate("task")
      .populate("student", "firstName lastName email");

    if (!submission) {
      return res.status(404).json({
        success: false,
        message: "Submission not found",
      });
    }

    const task = submission.task as any;

    // Check permissions for mentors
    if (user.role === "mentor") {
      const hasAccess = user.hasAccessToTrack(
        task.cohort.toString(),
        task.track.toString(),
      );
      if (!hasAccess) {
        return res.status(403).json({
          success: false,
          message: "Access denied",
        });
      }
    }

    // Validate score
    if (score !== undefined) {
      if (typeof score !== "number" || score < 0 || score > task.maxScore) {
        return res.status(400).json({
          success: false,
          message: `Score must be between 0 and ${task.maxScore}`,
        });
      }
      submission.score = score;
    }

    if (feedback) {
      submission.feedback = feedback.trim();
    }

    submission.gradedBy = user._id;
    submission.gradedAt = new Date();
    submission.status = "graded";

    await submission.save();

    const updatedSubmission = await Submission.findById(submission._id)
      .populate("task", "title maxScore")
      .populate("student", "firstName lastName email")
      .populate("gradedBy", "firstName lastName email role");

    res.status(200).json({
      success: true,
      message: "Submission graded successfully",
      data: updatedSubmission,
    });
  },
);

// Get submissions for a task (for mentors and admins)
export const getTaskSubmissions = asyncHandler(
  async (req: AuthRequest, res: Response) => {
    const { id } = req.params;
    const { page = 1, limit = 10, status } = req.query;
    const user = req.user!;

    if (user.role === "student") {
      return res.status(403).json({
        success: false,
        message: "Students cannot view all submissions",
      });
    }

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

    // Check permissions for mentors
    if (user.role === "mentor") {
      const hasAccess = user.hasAccessToTrack(
        task.cohort.toString(),
        task.track.toString(),
      );
      if (!hasAccess) {
        return res.status(403).json({
          success: false,
          message: "Access denied",
        });
      }
    }

    const filter: any = { task: id };
    if (status) {
      filter.status = status;
    }

    const skip = (Number(page) - 1) * Number(limit);

    const submissions = await Submission.find(filter)
      .populate("student", "firstName lastName email")
      .populate("gradedBy", "firstName lastName email role")
      .sort({ submittedAt: -1 })
      .skip(skip)
      .limit(Number(limit));

    const total = await Submission.countDocuments(filter);

    res.status(200).json({
      success: true,
      message: "Submissions retrieved successfully",
      data: {
        submissions,
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
