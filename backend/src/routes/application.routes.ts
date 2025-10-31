import { Router } from "express";
import {
  submitApplication,
  getApplications,
  reviewApplication,
  getApplicationDetails,
} from "../controllers/application.controller";
import { authenticate, authorize } from "../middleware/auth";
import { validateApplication } from "../middleware/validation";
import { uploadCV } from "../services/upload.service";

const router = Router();

// Public routes
router.post(
  "/apply",
  uploadCV.single("cv") as any,
  validateApplication,
  submitApplication,
);

// Protected routes
router.use(authenticate);

// Student/Applicant routes
router.get("/:id", getApplicationDetails);

// Mentor/Admin routes
router.get("/", authorize("mentor", "admin"), getApplications);
router.patch("/:id/review", authorize("mentor", "admin"), reviewApplication);

export default router;
