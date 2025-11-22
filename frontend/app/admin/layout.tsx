"use client";
import { useState } from "react";
import { RoleGuard } from "@/middleware/roleGuard";
import { AdminSidebar } from "@/components/layout/admin-sidebar";
import { Navbar } from "@/components/layout/navbar";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [isSidebarOpen, setSidebarOpen] = useState(false);
  return (
    <RoleGuard allowedRoles={["admin"]}>
      <div className="flex min-h-screen bg-gray-50">
        <AdminSidebar
          open={isSidebarOpen}
          onClose={() => setSidebarOpen(false)}
        />
        <div className="flex-1 flex flex-col min-w-0">
          <Navbar
            title="Admin Panel"
            onOpenSidebar={() => setSidebarOpen(true)}
          />
          <main className="flex-1 p-4 sm:p-6 lg:p-8"> {children} </main>
        </div>
      </div>
    </RoleGuard>
  );
}
