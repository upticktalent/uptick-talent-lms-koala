import { Router } from "express";
import {
  getTasks,
  getTaskById,
  createTask,
  updateTask,
  deleteTask,
  submitTask,
  gradeTaskSubmission,
  getTaskSubmissions,
  getStudentTasks,
  getMentorTasks,
  getStudentSubmissions,
  getPendingGrading,
  uploadTaskResource,
  returnSubmissionForRevision,
} from "../controllers/task.controller";
import { authenticate, authorize } from "../middleware/auth";
import { uploadTaskMedia } from "../services/upload.service";

const router = Router();

// All routes require authentication
router.use(authenticate);

// Public routes for authenticated users
router.get("/", getTasks);
router.get("/:id", getTaskById);

// Student routes
router.post("/:id/submit", authorize("student"), submitTask);
router.get("/student", authorize("student"), getStudentTasks);
router.get("/student/submissions", authorize("student"), getStudentSubmissions);

// Mentor/Admin only routes
router.use(authorize("mentor", "admin"));
router.post("/", createTask);
router.patch("/:id", updateTask);
router.delete("/:id", deleteTask);
router.get("/:id/submissions", getTaskSubmissions);
router.patch("/:id/submissions/:submissionId/grade", gradeTaskSubmission);
router.post(
  "/:id/submissions/:submissionId/return",
  returnSubmissionForRevision,
);

// Dashboard routes
router.get("/mentor", getMentorTasks);
router.get("/mentor/pending-grading", getPendingGrading);

// File upload route
router.post(
  "/upload-resource", 
  authorize("mentor", "admin"),
  uploadTaskMedia.array("files", 5) as any, // Allow up to 5 files
  uploadTaskResource
);

export default router;
