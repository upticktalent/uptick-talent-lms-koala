"use client";

import { useState } from "react";
import { AuthGuard } from "@/middleware/authGuard";
import { RoleGuard } from "@/middleware/roleGuard";
import { Sidebar } from "@/components/layout/sidebar";
import { Navbar } from "@/components/layout/navbar";

export default function LMSLayout({ children }: { children: React.ReactNode }) {
  const [isSidebarOpen, setSidebarOpen] = useState(false);

  return (
    <AuthGuard>
      <RoleGuard allowedRoles={["admin", "mentor", "student"]}>
        <div className="h-screen flex bg-gray-100">
          <Sidebar open={isSidebarOpen} onClose={() => setSidebarOpen(false)} />
          <div className="flex-1 flex flex-col overflow-hidden">
            <Navbar onOpenSidebar={() => setSidebarOpen(true)} />
            <main className="flex-1 overflow-auto p-3 sm:p-4">{children}</main>
          </div>
        </div>
      </RoleGuard>
    </AuthGuard>
  );
}
