import { Router } from "express";
import {
  submitApplication,
  getApplications,
  reviewApplication,
  getApplicationDetails,
  getAvailableTracks,
  getApplicationsByCohort,
  getApplicationsByTrack,
  acceptApplication,
  shortlistApplication,
  rejectApplication,
  getApplicationStats,
  bulkUpdateApplications,
  exportApplications,
} from "../controllers/application.controller";
import { authenticate, authorize } from "../middleware/auth";
import {
  validateApplication,
  validateReviewApplication,
  validatePagination,
} from "../middleware/validation";
import { uploadCV, handleUploadError } from "../services/upload.service";
import { Request, Response, NextFunction } from "express";

const router = Router();

// Upload error handling middleware
const handleFileUploadErrors = (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  const upload = uploadCV.single("cv");
  upload(req as any, res as any, (err: any) => {
    if (err) {
      const errorResponse = handleUploadError(err);
      return res.status(errorResponse.status).json({
        success: false,
        message: errorResponse.message,
        errorType: errorResponse.type,
      });
    }
    next();
  });
};

// Public routes
router.post(
  "/apply",
  handleFileUploadErrors,
  validateApplication,
  submitApplication,
);

// Protected routes
router.use(authenticate);

// Student/Applicant routes
router.get("/:id", getApplicationDetails);

// Mentor/Admin routes
router.get(
  "/",
  authorize("mentor", "admin"),
  validatePagination,
  getApplications,
);
router.patch(
  "/:id/review",
  authorize("mentor", "admin"),
  validateReviewApplication,
  reviewApplication,
);

// Additional application management routes
router.get(
  "/available-tracks",
  getAvailableTracks,
);

router.get(
  "/cohort/:cohortId",
  authorize("mentor", "admin"),
  getApplicationsByCohort,
);

router.get(
  "/track/:trackId",
  authorize("mentor", "admin"),
  getApplicationsByTrack,
);

router.get(
  "/stats",
  authorize("mentor", "admin"),
  getApplicationStats,
);

router.get(
  "/export",
  authorize("admin"),
  exportApplications,
);

// Application actions (admin only)
router.post(
  "/:id/accept",
  authorize("admin"),
  acceptApplication,
);

router.patch(
  "/:id/shortlist",
  authorize("mentor", "admin"),
  shortlistApplication,
);

router.patch(
  "/:id/reject",
  authorize("mentor", "admin"),
  rejectApplication,
);

router.patch(
  "/bulk-update",
  authorize("admin"),
  bulkUpdateApplications,
);

export default router;
