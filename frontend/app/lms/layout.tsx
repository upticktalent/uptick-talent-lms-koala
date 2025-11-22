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
        <div className="min-h-screen flex bg-gray-100">
          <Sidebar open={isSidebarOpen} onClose={() => setSidebarOpen(false)} />

          <div className="flex-1 flex flex-col min-w-0">
            <Navbar onOpenSidebar={() => setSidebarOpen(true)} />

            {/* Main content scrolls naturally with the window */}
            <main className="flex-1 p-3 sm:p-4">
              {children}
            </main>
          </div>
        </div>
      </RoleGuard>
    </AuthGuard>
  );
}
