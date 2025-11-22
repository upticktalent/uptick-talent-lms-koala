import { Router } from "express";
import {
  getMaterials,
  getMaterialById,
  createMaterial,
  updateMaterial,
  deleteMaterial,
  getStudentMaterials,
  getMentorMaterials,
  getMaterialsByCategory,
  getRequiredMaterials,
  trackMaterialAccess,
  uploadMaterialFile,
  getMaterialAnalytics,
} from "../controllers/material.controller";
import { authenticate, authorize } from "../middleware/auth";

const router = Router();

// All routes require authentication
router.use(authenticate);

// Public routes for authenticated users
router.get("/", getMaterials);
router.get("/:id", getMaterialById);
router.post("/:id/access", trackMaterialAccess);

// Dashboard routes (role-specific)
router.get("/student", authorize("student"), getStudentMaterials);
router.get("/mentor", authorize("mentor", "admin"), getMentorMaterials);

// Category and filtering routes
router.get("/category/:category", getMaterialsByCategory);
router.get("/required", getRequiredMaterials);

// Mentor/Admin only routes
router.use(authorize("mentor", "admin"));
router.post("/", createMaterial);
router.patch("/:id", updateMaterial);
router.delete("/:id", deleteMaterial);

// File upload route
router.post("/upload", uploadMaterialFile);

// Analytics route
router.get("/:id/analytics", getMaterialAnalytics);

export default router;
