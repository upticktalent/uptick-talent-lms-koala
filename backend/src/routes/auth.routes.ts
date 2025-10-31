import { Router } from "express";
import {
  login,
  resetPassword,
  getProfile,
} from "../controllers/auth.controller";
import { authenticate } from "../middleware/auth";
import { validateLogin, validatePasswordReset } from "../middleware/validation";
import { urls } from "../constants/urls";

const router = Router();

// Public routes
router.post(urls.auth.login(), validateLogin, login);

// Protected routes
router.use(authenticate);
router.post(urls.auth.resetPassword(), validatePasswordReset, resetPassword);
router.get(urls.auth.profile(), getProfile);

export default router;
