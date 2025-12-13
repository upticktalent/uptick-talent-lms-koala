import { Router } from "express";
import { authenticate, authorize } from "../middleware/auth";
import { ensureTrackAssignments } from "../middleware/trackPermissions";
import {
  // Interview Slots (Admin/Mentor)
  createInterviewSlots,
  getInterviewerSlots,
  getAllInterviewSlots,
  getInterviewSlot,
  updateInterviewSlot,
  deleteInterviewSlot,
  getAvailableSlots,

  // Interview Scheduling
  scheduleInterview,
  getInterviewDetails,
  getInterviews,
  getInterviewByApplication,

  // Interview Review
  reviewInterview,
  updateInterview,
  cancelInterview,
} from "../controllers/interview.controller";

const router = Router();

// ==================== INTERVIEW SLOTS ROUTES ====================

// Create interview slots (Admin/Mentor only)
router.post(
  "/slots",
  authenticate,
  authorize("admin", "mentor"),
  createInterviewSlots,
);

// Get all interview slots (Admin only)
router.get(
  "/slots/all",
  authenticate,
  authorize("admin", "mentor"),
  getAllInterviewSlots,
);

// Get interviewer's own slots (Admin/Mentor only)
router.get(
  "/slots/my-slots",
  authenticate,
  authorize("admin", "mentor"),
  getInterviewerSlots,
);

// Get available slots for applicants (Public - accessible to applicants)
router.get("/slots/available", getAvailableSlots);

// Get single interview slot by ID (Admin/Mentor only)
router.get(
  "/slots/:id",
  authenticate,
  authorize("admin", "mentor"),
  getInterviewSlot,
);

// Update interview slot (Admin/Mentor only)
router.patch(
  "/slots/:id",
  authenticate,
  authorize("admin", "mentor"),
  updateInterviewSlot,
);

// Delete interview slot (Admin/Mentor only)
router.delete(
  "/slots/:id",
  authenticate,
  authorize("admin", "mentor"),
  deleteInterviewSlot,
);

// ==================== INTERVIEW MANAGEMENT ROUTES ====================

// Schedule an interview (Public - applicants can access via application link)
router.post("/schedule", scheduleInterview);

// Get all interviews (Admin/Mentor only)
router.get(
  "/",
  authenticate,
  ensureTrackAssignments,
  authorize("admin", "mentor"),
  getInterviews,
);

// Get interview details by ID (Admin/Mentor only)
router.get(
  "/:id",
  authenticate,
  ensureTrackAssignments,
  authorize("admin", "mentor"),
  getInterviewDetails,
);

// Get interview by application ID (Public - for applicants)
router.get("/application/:applicationId", getInterviewByApplication);

// Update interview details (Admin/Mentor only)
router.patch(
  "/:id",
  authenticate,
  authorize("admin", "mentor"),
  updateInterview,
);

// Review interview and update application status (Admin only)
router.patch(
  "/:id/review",
  authenticate,
  authorize("admin", "mentor"),
  reviewInterview,
);

// Cancel interview (Admin/Mentor only)
router.patch(
  "/:id/cancel",
  authenticate,
  authorize("admin", "mentor"),
  cancelInterview,
);

export default router;
