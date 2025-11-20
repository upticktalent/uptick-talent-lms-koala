import { Router } from "express";
import {
  getTracks,
  getActiveTracks,
  getTrackDetails,
  getTrackByTrackId,
  createTrack,
  updateTrack,
  deleteTrack,
} from "../controllers/track.controller";
import { authenticate, authorize } from "../middleware/auth";

const router = Router();

// Public routes
router.get("/active", getActiveTracks);
router.get("/trackId/:trackId", getTrackByTrackId);
router.get("/:id", getTrackDetails);

// Protected routes - Admin and Mentor only
router.use(authenticate);
router.use(authorize("admin", "mentor"));

router.get("/", getTracks);
router.post("/create", createTrack);
router.put("/:id", updateTrack);
router.delete("/:id", deleteTrack);

export default router;
