import { Router } from "express";
import {
  submitAssessment,
  getAssessments,
  getAssessmentDetails,
  reviewAssessment,
  getAssessmentByApplication,
  checkApplicationEligibility,
} from "../controllers/assessment.controller";
import { uploadAssessment } from "../services/upload.service";
import { authenticate } from "../middleware/auth";
import { validate } from "../middleware/validation";
import {
  assessmentSubmissionSchema,
  assessmentReviewSchema,
} from "../schemas/validation";

const router = Router();

// Public routes (for applicants)
router.post(
  "/submit",
  uploadAssessment.single("file") as any, // Optional file upload
  submitAssessment,
);

// Check if application ID exists and is eligible for assessment
router.get("/check-application/:applicationId", checkApplicationEligibility);

router.get("/application/:applicationId", getAssessmentByApplication);

// Protected routes (for admin/mentors)
router.use(authenticate); // All routes below require authentication

router.get("/", getAssessments);
router.get("/:id", getAssessmentDetails);
router.put("/:id/review", validate(assessmentReviewSchema), reviewAssessment);

export default router;
