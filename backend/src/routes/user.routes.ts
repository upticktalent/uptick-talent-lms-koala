import { Router } from "express";
import {
  getUsers,
  getAllUsers,
  getMentors,
  getUserDetails,
  createUser,
  updateUser,
  toggleUserStatus,
  assignTracksToMentor,
  deleteUser,
  getStudents,
  getStudentDetails,
  assignTrackToStudent,
  getStudentsByCohort,
  resetUserPassword,
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
router.get("/all", getAllUsers); // For dropdowns and selects

// Student routes (accessible by mentor and admin)
router.get(
  "/students",
  authorize("mentor", "admin"),
  validatePagination,
  getStudents,
);
router.get(
  "/students/cohort/:cohortId",
  authorize("mentor", "admin"),
  getStudentsByCohort,
);
router.get("/students/:id", authorize("mentor", "admin"), getStudentDetails);

// Admin-only routes (mentors can also create other mentors)
router.post("/", authorize("admin", "mentor"), validateCreateUser, createUser);

// Remaining admin-only routes
router.use(authorize("admin"));

// User management routes
router.get("/", validatePagination, getUsers);
router.get("/:id", getUserDetails);
router.post("/", validateCreateUser, createUser);
router.put("/:id", validateUpdateUser, updateUser);
router.patch("/:id/toggle-status", toggleUserStatus);
router.patch("/:id/assign-tracks", assignTracksToMentor);
router.patch("/students/:id/assign-track", assignTrackToStudent);
router.post("/:id/reset-password", resetUserPassword);
router.delete("/:id", deleteUser);

export default router;
