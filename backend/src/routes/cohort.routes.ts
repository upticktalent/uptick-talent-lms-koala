import { Router } from "express";
import {
  getCohorts,
  getActiveCohorts,
  getCurrentActiveCohort,
  getCohortDetails,
  createCohort,
  updateCohort,
  deleteCohort,
  setActiveCohort,
  addTracksToCohor,
  removeTrackFromCohort,
  getCohortTracks,
} from "../controllers/cohort.controller";
import { authenticate, authorize } from "../middleware/auth";

const router = Router();

// Public routes
router.get("/active", getActiveCohorts);
router.get("/current-active", getCurrentActiveCohort);
router.get("/:id", getCohortDetails);

// Protected routes - Admin only
router.use(authenticate);
router.use(authorize("admin"));

router.get("/", getCohorts);
router.post("/create", createCohort);
router.put("/:id", updateCohort);
router.delete("/:id", deleteCohort);

// New cohort management routes
router.post("/:id/set-active", setActiveCohort);
router.post("/:id/tracks", addTracksToCohor);
router.delete("/:id/tracks/:trackId", removeTrackFromCohort);
router.get("/:id/tracks", getCohortTracks);

export default router;
