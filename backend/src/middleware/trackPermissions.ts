import { Request, Response, NextFunction } from "express";
import { AuthRequest } from "./auth";

/**
 * Middleware to ensure user has proper track assignments for permission checks
 * Converts legacy assignedTracks to trackAssignments format if needed
 */
export const ensureTrackAssignments = (
  req: AuthRequest,
  res: Response,
  next: NextFunction,
) => {
  if (req.user && req.user.role === "mentor") {
    // If user has assignedTracks but no trackAssignments, create temporary assignments
    if (
      req.user.assignedTracks &&
      req.user.assignedTracks.length > 0 &&
      (!req.user.trackAssignments || req.user.trackAssignments.length === 0)
    ) {
      req.user.trackAssignments = req.user.assignedTracks.map(
        (trackId: any) => ({
          cohort: null, // General assignment across all cohorts
          track: trackId,
          role: "mentor" as const,
          assignedAt: new Date(),
          isActive: true,
        }),
      );
    }
  }
  next();
};

/**
 * Helper function to get mentor's assigned track IDs
 */
export const getMentorTrackIds = (user: any): string[] => {
  if (!user || user.role !== "mentor") return [];

  // Use trackAssignments if available
  if (user.trackAssignments && user.trackAssignments.length > 0) {
    return user.trackAssignments
      .filter(
        (assignment: any) =>
          assignment.role === "mentor" && assignment.isActive,
      )
      .map((assignment: any) => assignment.track.toString());
  }

  // Fallback to legacy assignedTracks
  if (user.assignedTracks && user.assignedTracks.length > 0) {
    return user.assignedTracks.map((trackId: any) => trackId.toString());
  }

  return [];
};

/**
 * Helper function to get mentor's cohort-track combinations
 */
export const getMentorCohortTrackPairs = (
  user: any,
): Array<{ cohort: string; track: string }> => {
  if (!user || user.role !== "mentor") return [];

  // Use trackAssignments for cohort-track combinations
  if (user.trackAssignments && user.trackAssignments.length > 0) {
    return user.trackAssignments
      .filter(
        (assignment: any) =>
          assignment.role === "mentor" && assignment.isActive,
      )
      .map((assignment: any) => ({
        cohort: assignment.cohort?.toString() || null,
        track: assignment.track.toString(),
      }));
  }

  return [];
};

/**
 * Check if mentor has access to a specific cohort-track combination
 */
export const hasCohortTrackAccess = (
  user: any,
  cohortId: string,
  trackId: string,
): boolean => {
  if (!user || user.role !== "mentor") return false;

  const pairs = getMentorCohortTrackPairs(user);
  return pairs.some(
    (pair) =>
      (!pair.cohort || pair.cohort === cohortId) && // null cohort means access to all cohorts
      pair.track === trackId,
  );
};

/**
 * Middleware to check if mentor has access to specific track
 */
export const checkTrackAccess = (trackField: string = "trackId") => {
  return (req: AuthRequest, res: Response, next: NextFunction) => {
    if (req.user?.role !== "mentor") {
      return next(); // Allow admin full access
    }

    const trackId =
      req.params[trackField] || req.body[trackField] || req.query[trackField];

    if (!trackId) {
      return next(); // No specific track to check
    }

    const mentorTrackIds = getMentorTrackIds(req.user);

    if (
      mentorTrackIds.length === 0 ||
      !mentorTrackIds.includes(trackId.toString())
    ) {
      return res.status(403).json({
        success: false,
        message: "Access denied: You can only access your assigned tracks",
      });
    }

    next();
  };
};
