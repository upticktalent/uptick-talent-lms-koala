import { Router } from "express";
import { authenticate, authorize } from "../middleware/auth";
import {
  sendDirectEmail,
  getEmailHistory,
  sendBulkEmails,
} from "../controllers/directEmail.controller";
import {
  validateBulkEmail,
  validateDirectEmail,
} from "../middleware/validation";

const router = Router();

// Send direct email (admin/mentor only)
router.post(
  "/send",
  authenticate,
  authorize("admin", "mentor"),
  validateDirectEmail,
  sendDirectEmail,
);

// Send bulk emails (admin only)
router.post(
  "/bulk",
  authenticate,
  authorize("admin"),
  validateBulkEmail,
  sendBulkEmails,
);

// Get email history (admin/mentor only)
router.get(
  "/history",
  authenticate,
  authorize("admin", "mentor"),
  getEmailHistory,
);

export default router;
