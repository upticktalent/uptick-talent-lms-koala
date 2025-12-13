import { Router } from "express";
import {
  getCohorts,
  getActiveCohorts,
  getCurrentActiveCohort,
  getCohortDetails,
  createCohort,
  updateCohort,
  deleteCohort,
  setCurrentlyActive,
  addTrackToCohort,
  removeTrackFromCohort,
  addMentorToTrack,
  removeMentorFromTrack,
  getTrackInActiveCohort,
  getCohortComplete,
  getCohortTrackData,
  getCohortStatistics,
  getCohortApplications,
  getCohortStudents,
} from "../controllers/cohort.controller";
import { authenticate, authorize } from "../middleware/auth";

const router = Router();

// Public routes
router.get("/active", getActiveCohorts);
router.get("/current-active", getCurrentActiveCohort);
router.get("/track/:trackId", getTrackInActiveCohort);
router.get("/:id", getCohortDetails);

// Protected routes - Admin only
router.use(authenticate);
router.use(authorize("admin"));

router.get("/", getCohorts);
router.post("/", createCohort);
router.patch("/:id", updateCohort);
router.delete("/:id", deleteCohort);

// Cohort management
router.patch("/:id/set-active", setCurrentlyActive);

// Track management within cohorts
router.post("/:id/tracks", addTrackToCohort);
router.delete("/:id/tracks/:trackId", removeTrackFromCohort);

// Mentor management within cohort tracks
router.post("/:id/tracks/:trackId/mentors", addMentorToTrack);
router.delete("/:id/tracks/:trackId/mentors/:mentorId", removeMentorFromTrack);

// New Cohort-Centric Routes
router.get("/:cohortId/complete", getCohortComplete);
router.get("/:cohortId/tracks/:trackId", getCohortTrackData);
router.get("/:cohortId/statistics", getCohortStatistics);
router.get("/:cohortId/applications", getCohortApplications);
router.get("/:cohortId/students", getCohortStudents);

export default router;
