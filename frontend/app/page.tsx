/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useUser } from "@/hooks/useUser";
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/hooks/useAuth";
import Loader from "@/components/Loader";

export default function Home() {
  const { isAuthenticated, loading } = useAuth();
  const { isAdmin } = useUser();
  const router = useRouter();

  useEffect(() => {
    // Wait until auth loading finishes before redirecting. Previously the
    // condition used `!== null` checks which are always true for booleans and
    // caused redirects while auth state was still initializing — leading to
    // navigation races and blank screens. Only redirect once `loading` is
    // false so `isAuthenticated` and `isAdmin` reflect the current user.
    if (loading) return;

    if (isAuthenticated) {
      router.replace(isAdmin ? "/admin/dashboard" : "/lms/dashboard");
    } else {
      router.replace("/auth/login");
    }
  }, [loading, isAuthenticated, isAdmin, router]);

  return <Loader />;
}
