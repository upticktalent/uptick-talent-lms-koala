"use client";

import { useState } from "react";
import { RoleGuard } from '@/middleware/roleGuard';
import { AdminSidebar } from "@/components/layout/admin-sidebar";
import { Navbar } from "@/components/layout/navbar";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [isSidebarOpen, setSidebarOpen] = useState(false);

  return (
    <RoleGuard allowedRoles={['admin']}>
      <div className="h-screen flex bg-gray-50">
        <AdminSidebar open={isSidebarOpen} onClose={() => setSidebarOpen(false)} />
        <div className="flex-1 flex flex-col overflow-hidden">
          <Navbar title="Admin Panel" onOpenSidebar={() => setSidebarOpen(true)} />
          <main className="flex-1 overflow-auto p-4 sm:p-6 lg:p-8">
            {children}
          </main>
        </div>
      </div>
    </RoleGuard>
  );
}
