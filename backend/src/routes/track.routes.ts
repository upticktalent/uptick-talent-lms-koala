import { Router } from "express";
import {
  getTracks,
  getActiveTracks,
  getTrackDetails,
  createTrack,
  updateTrack,
  deleteTrack,
} from "../controllers/track.controller";
import { authenticate, authorize } from "../middleware/auth";

const router = Router();

// Public routes
router.get("/active", getActiveTracks);
router.get("/:id", getTrackDetails);

// Protected routes - Admin only
router.use(authenticate);
router.use(authorize("admin"));

router.get("/", getTracks);
router.post("/create", createTrack);
router.put("/:id", updateTrack);
router.delete("/:id", deleteTrack);

export default router;
