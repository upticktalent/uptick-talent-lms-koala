"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/hooks/useAuth";
import { LoaderCircle } from "lucide-react";
import { useUser } from "@/hooks/useUser";

export default function Home() {
  const { isAuthenticated, loading } = useAuth();
  const {isAdmin} = useUser()
  const router = useRouter();

  useEffect(() => {
    if (!loading) {
      if (isAuthenticated) {
        if (isAdmin) {
           router.replace("/admin/dashboard");
        } else {
           router.replace("/lms/dashboard");
        }
       
      } else {
        router.replace("/auth/login");
      }
    }
  }, [isAuthenticated, loading, router]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="text-gray-600">
        <LoaderCircle className="text-indigo-600 animate-spin w-8 h-8" />
      </div>
    </div>
  );
}
