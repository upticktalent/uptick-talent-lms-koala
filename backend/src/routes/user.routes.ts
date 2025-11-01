import { Router } from "express";
import {
  getUsers,
  getMentors,
  getUserDetails,
  createUser,
  updateUser,
  toggleUserStatus,
  assignTracksToMentor,
  deleteUser,
} from "../controllers/user.controller";
import { authenticate, authorize } from "../middleware/auth";
import {
  validateCreateUser,
  validateUpdateUser,
  validatePagination,
} from "../middleware/validation";

const router = Router();

// All routes require authentication
router.use(authenticate);

// Public routes for authenticated users
router.get("/mentors", getMentors);

// Admin-only routes
router.use(authorize("admin"));

// User management routes
router.get("/", validatePagination, getUsers);
router.get("/:id", getUserDetails);
router.post("/", validateCreateUser, createUser);
router.put("/:id", validateUpdateUser, updateUser);
router.patch("/:id/toggle-status", toggleUserStatus);
router.patch("/:id/assign-tracks", assignTracksToMentor);
router.delete("/:id", deleteUser);

export default router;
