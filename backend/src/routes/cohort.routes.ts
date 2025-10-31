import { Router } from "express";
import {
  getCohorts,
  getActiveCohorts,
  getCohortDetails,
  createCohort,
  updateCohort,
  deleteCohort,
} from "../controllers/cohort.controller";
import { authenticate, authorize } from "../middleware/auth";

const router = Router();

// Public routes
router.get("/active", getActiveCohorts);
router.get("/:id", getCohortDetails);

// Protected routes - Admin only
router.use(authenticate);
router.use(authorize("admin"));

router.get("/", getCohorts);
router.post("/", createCohort);
router.put("/:id", updateCohort);
router.delete("/:id", deleteCohort);

export default router;
