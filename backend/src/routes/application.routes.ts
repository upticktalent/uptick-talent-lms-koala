import { Router } from "express";
import {
  submitApplication,
  getApplications,
  reviewApplication,
  getApplicationDetails,
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

export default router;
