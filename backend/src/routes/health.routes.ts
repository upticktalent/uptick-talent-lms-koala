import {
  getDetailedHealth,
  getHealth,
  getLiveness,
  getReadiness,
} from "@controllers/health.controller";

import { Router } from "express";
import { urls } from "@constants/urls";

const router = Router();

// Basic health check
router.get(urls.health.root(), getHealth);

// Detailed health check (includes DB status, uptime, etc.)
router.get(urls.health.detailed(), getDetailedHealth);

// Kubernetes-style probes
router.get(urls.health.liveness(), getLiveness);
router.get(urls.health.readiness(), getReadiness);

export default router;
