import { Router } from "express";
import { authenticate, authorize } from "../middleware/auth";
import {
  validateEmailTemplate,
  validateUpdateEmailTemplate,
  validateSendSingleEmail,
} from "../middleware/validation";
import {
  getEmailTemplates,
  getEmailTemplate,
  createEmailTemplate,
  updateEmailTemplate,
  deleteEmailTemplate,
  previewEmailTemplate,
  sendTestEmail,
  getTemplateVariables,
  getEmailRecipients,
  sendSingleEmail,
  getEmailLogs,
} from "../controllers/emailTemplate.controller";

const router = Router();

// Public routes (for getting available variables)
router.get("/variables", getTemplateVariables);

// Protected routes - require authentication
router.use(authenticate);

// Get all templates and create new template
router.get("/", getEmailTemplates);
router.post(
  "/",
  authorize("admin", "mentor"),
  validateEmailTemplate,
  createEmailTemplate,
);

// Single template operations
router.get("/:id", getEmailTemplate);
router.put(
  "/:id",
  authorize("admin", "mentor"),
  validateUpdateEmailTemplate,
  updateEmailTemplate,
);
router.delete("/:id", authorize("admin"), deleteEmailTemplate);

// Template preview and testing
router.post("/:id/preview", previewEmailTemplate);
router.post("/:id/test", authorize("admin", "mentor"), sendTestEmail);

// Email sending
router.post(
  "/send",
  authorize("admin", "mentor"),
  validateSendSingleEmail,
  sendSingleEmail,
);

// Recipients and logs
router.get(
  "/recipients/list",
  authorize("admin", "mentor"),
  getEmailRecipients,
);
router.get("/logs/history", authorize("admin", "mentor"), getEmailLogs);

export default router;
