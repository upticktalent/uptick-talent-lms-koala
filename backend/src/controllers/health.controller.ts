import { NextFunction, Request, Response } from "express";

import mongoose from "mongoose";

// Basic health check
export const getHealth = async (
  _req: Request,
  res: Response,
  _next: NextFunction,
) => {
  res.status(200).json({
    success: true,
    message: "Server is running",
    timestamp: new Date().toISOString(),
  });
};

// Detailed health check with DB and system info
export const getDetailedHealth = async (
  _req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const dbState = mongoose.connection.readyState;
    const dbStatusMap: Record<number, string> = {
      0: "disconnected",
      1: "connected",
      2: "connecting",
      3: "disconnecting",
    };
    const dbStatus = dbStatusMap[dbState] ?? "unknown";

    const isHealthy = dbState === 1;

    res.status(isHealthy ? 200 : 503).json({
      success: isHealthy,
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      database: {
        status: dbStatus,
        connected: dbState === 1,
      },
      memory: {
        usage: process.memoryUsage(),
        free: Math.round(
          (process.memoryUsage().heapTotal - process.memoryUsage().heapUsed) /
            1024 /
            1024,
        ),
        total: Math.round(process.memoryUsage().heapTotal / 1024 / 1024),
        unit: "MB",
      },
      environment: process.env.NODE_ENV || "development",
    });
  } catch (error) {
    next(error);
  }
};

// Liveness probe - checks if app is running
export const getLiveness = async (
  _req: Request,
  res: Response,
  _next: NextFunction,
) => {
  res.status(200).json({
    status: "alive",
    timestamp: new Date().toISOString(),
  });
};

// Readiness probe - checks if app is ready to receive traffic
export const getReadiness = async (
  _req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const dbState = mongoose.connection.readyState;
    const isReady = dbState === 1;

    res.status(isReady ? 200 : 503).json({
      status: isReady ? "ready" : "not ready",
      database: dbState === 1 ? "connected" : "not connected",
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    next(error);
  }
};
