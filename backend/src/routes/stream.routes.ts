import { Router } from "express";
import {
  getStreams,
  getStreamById,
  createStream,
  updateStream,
  deleteStream,
  addReaction,
  removeReaction,
  addComment,
  addCommentReply,
  getStudentStreams,
  getMentorStreams,
  uploadAttachment,
  getStreamAnalytics,
} from "../controllers/stream.controller";
import { authenticate, authorize } from "../middleware/auth";

const router = Router();

// All routes require authentication
router.use(authenticate);

// Public routes for authenticated users
router.get("/", getStreams);
router.get("/:id", getStreamById);

// Mentor/Admin only routes
router.use(authorize("mentor", "admin"));
router.post("/", createStream);
router.patch("/:id", updateStream);
router.delete("/:id", deleteStream);

// Student interaction routes (all authenticated users)
router.post("/:id/reactions", addReaction);
router.delete("/:id/reactions", removeReaction);
router.post("/:id/comments", addComment);
router.post("/:id/comments/:commentId/replies", addCommentReply);

// Dashboard routes (role-specific)
router.get("/student", authorize("student"), getStudentStreams);
router.get("/mentor", authorize("mentor", "admin"), getMentorStreams);

// File upload route (mentor/admin only)
router.post(
  "/upload-attachment",
  authorize("mentor", "admin"),
  uploadAttachment,
);

// Analytics route (mentor/admin only)
router.get("/:id/analytics", authorize("mentor", "admin"), getStreamAnalytics);

export default router;
