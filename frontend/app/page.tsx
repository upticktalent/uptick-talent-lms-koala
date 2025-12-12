"use client";

import { useUser } from "@/hooks/useUser";
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/hooks/useAuth";

import { ThemeToggle } from "@/components/theme-toggle";
import Loader from "@/components/Loader";

export default function Home() {
  const { isAuthenticated, loading } = useAuth();
  const { isAdmin, isStudent, user } = useUser();
  const router = useRouter();

  useEffect(() => {
    if (!loading) {
      if (isAuthenticated) {
        if (isAdmin) {
          router.replace("/admin/dashboard");
        } else if (isStudent && user) {
          // Redirect students to their specific track
          const activeAssignment = user.trackAssignments?.find(
            (assignment: any) => assignment.isActive
          );

          if (activeAssignment?.track) {
            const track = activeAssignment.track;
            // Check if track is populated object or just string ID
            if (typeof track === "object" && track.trackId) {
              router.replace(`/lms/track/${track.trackId}/stream`);
            } else if (typeof track === "object" && track._id) {
              router.replace(`/lms/track/${track._id}/stream`);
            } else if (typeof track === "string") {
              router.replace(`/lms/track/${track}/stream`);
            } else {
              // Fallback if no valid track found
              router.replace("/lms/dashboard");
            }
          } else {
            // Fallback if no track assignment found
            router.replace("/lms/dashboard");
          }
        } else {
          // Mentor or other roles
          router.replace("/lms/dashboard");
        }
      } else {
        router.replace("/auth/login");
      }
    }
  }, [isAuthenticated, loading, isAdmin, isStudent, user, router]);

  if (loading) {
    return <Loader />;
  }

  if (isAuthenticated) {
    return null;
  }

  return <Loader />;
}
