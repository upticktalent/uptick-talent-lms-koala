import { Router } from "express";
import { authorize } from "../middleware/auth";
import {
  createStream,
  getStreams,
  updateStream,
  deleteStream,
} from "../controllers/stream.controller";

const router = Router();

// Create stream (admin and mentors only)
router.post("/", authorize("admin", "mentor"), createStream);

// Get streams for a cohort/track
router.get("/cohort/:cohortId/track/:trackId", getStreams);

// Update stream (admin and mentors only)
router.put("/:id", authorize("admin", "mentor"), updateStream);

// Delete stream (admin only)
router.delete("/:id", authorize("admin"), deleteStream);

export default router;
