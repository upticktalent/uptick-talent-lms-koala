import { Router } from "express";
import {
  createTask,
  getTasks,
  getTaskDetails,
  submitTask,
  gradeSubmission,
  getTaskSubmissions,
} from "../controllers/task.controller";
import { authenticate, authorize } from "../middleware/auth";

const router = Router();

// All routes require authentication
router.use(authenticate);

// Create task (admin and mentors only)
router.post("/", authorize("admin", "mentor"), createTask);

// Get tasks for a cohort/track
router.get("/cohort/:cohortId/track/:trackId", getTasks);

// Get single task details
router.get("/:id", getTaskDetails);

// Submit task (students only)
router.post("/:id/submit", authorize("student"), submitTask);

// Grade submission (admin and mentors only)
router.put(
  "/submission/:id/grade",
  authorize("admin", "mentor"),
  gradeSubmission,
);

// Get task submissions (admin and mentors only)
router.get(
  "/:id/submissions",
  authorize("admin", "mentor"),
  getTaskSubmissions,
);

export default router;
