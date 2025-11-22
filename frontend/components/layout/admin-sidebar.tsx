"use client";

import React, { useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { cn } from "@/utils/cn";
import { useUser } from "@/hooks/useUser";
import {
  LayoutDashboard,
  Users,
  Settings,
  ChevronRight,
  X,
  BookOpen,
  Layers,
  UserCheck,
  GraduationCap,
  MonitorPlay,
  BookOpenCheck,
} from "lucide-react";

interface AdminSidebarProps {
  className?: string;
  open?: boolean;
  onClose?: () => void;
}

export function AdminSidebar({
  className,
  open = false,
  onClose,
}: AdminSidebarProps) {
  const pathname = usePathname();
  const { user } = useUser();

  const navigation = [
    {
      name: "Dashboard",
      href: "/admin/dashboard",
      icon: LayoutDashboard,
      show: true,
    },
    {
      name: "LMS",
      href: "/lms/dashboard",
      icon: MonitorPlay,
      show: true,
    },
    {
      name: "Cohorts",
      href: "/admin/cohorts",
      icon: Layers,
      show: true,
    },
    {
      name: "Mentors",
      href: "/admin/mentors",
      icon: UserCheck,
      show: true,
    },
    {
      name: "Students",
      href: "/admin/students",
      icon: GraduationCap,
      show: true,
    },
    {
      name: "Tracks",
      href: "/admin/tracks",
      icon: BookOpenCheck,
      show: true,
    },
  ];

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        onClose?.();
      }
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  const isActivePath = (href: string) => {
    if (href === "/admin/dashboard") {
      return pathname === href;
    }
    return pathname.startsWith(href);
  };

  return (
    <>
      {/* Desktop admin sidebar (minimal) */}
      <aside
        className={cn(
          "sticky top-0 h-screen w-56 hidden lg:flex flex-col bg-[hsl(var(--card))] border-r border-[hsl(var(--border))]",
          className
        )}
      >
        <div className="flex flex-col flex-1 min-h-0">
          <div className="flex items-center h-14 px-4">
            <div className="flex items-center gap-3">
              <Image
                src="/uptick-logo.png"
                alt="Uptick"
                width={50}
                height={50}
                className="object-contain rounded"
              />
            </div>
          </div>

          <nav className="flex-1 px-2 py-4 space-y-1">
            {navigation.map((item) => {
              if (!item.show) return null;
              const Icon = item.icon;
              const isActive = isActivePath(item.href);

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    "flex items-center px-3 py-2 text-sm rounded transition-colors",
                    isActive
                      ? "bg-blue-50 text-blue-700"
                      : "text-gray-700 hover:bg-gray-100"
                  )}
                >
                  <Icon
                    className={cn(
                      "h-5 w-5 mr-3",
                      isActive ? "text-blue-600" : "text-gray-400"
                    )}
                  />
                  <span className="truncate">{item.name}</span>
                </Link>
              );
            })}
          </nav>

          <div className="px-4 py-3 border-t border-[hsl(var(--border))]">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 bg-blue-600 rounded-full flex items-center justify-center text-white font-medium">
                {user?.firstName?.[0]}
                {user?.lastName?.[0]}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-900 truncate">
                  {user?.firstName} {user?.lastName}
                </p>
                <p className="text-xs text-gray-500 capitalize">{user?.role}</p>
              </div>
            </div>
          </div>
        </div>
      </aside>

      {/* Mobile drawer (simplified) */}
      <div
        className={cn(
          "md:hidden fixed inset-0 z-100 flex",
          open ? "pointer-events-auto" : "pointer-events-none"
        )}
        aria-hidden={!open}
      >
        <div
          className={cn(
            "fixed inset-0 bg-black/40 transition-opacity duration-200",
            open ? "opacity-100" : "opacity-0"
          )}
          onClick={() => onClose && onClose()}
        />

        <div
          className={cn(
            "relative w-72 h-full bg-[hsl(var(--card))] shadow-xl transform transition-transform duration-300 ease-in-out border-r border-[hsl(var(--border))]",
            open ? "translate-x-0" : "-translate-x-full"
          )}
        >
          <div className="flex items-center justify-between h-14 px-4 ">
            <div className="flex items-center gap-3">
              <Image
                src="/uptick-logo.png"
                alt="Uptick"
                width={50}
                height={50}
                className="object-contain"
              />
            </div>
            <button
              className="p-2 rounded-md text-gray-600 hover:bg-gray-100"
              onClick={() => onClose && onClose()}
              aria-label="Close sidebar"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          <nav className="px-3 py-4 space-y-1 overflow-auto h-[calc(100%-56px)]">
            {navigation.map((item) => {
              if (!item.show) return null;
              const Icon = item.icon;
              const isActive = isActivePath(item.href);

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => onClose && onClose()}
                  className={cn(
                    "flex items-center px-3 py-2 text-sm rounded transition-colors",
                    isActive
                      ? "bg-blue-50 text-blue-700"
                      : "text-gray-700 hover:bg-gray-100"
                  )}
                >
                  <Icon
                    className={cn(
                      "h-5 w-5 mr-3",
                      isActive ? "text-blue-600" : "text-gray-400"
                    )}
                  />
                  <span className="truncate">{item.name}</span>
                </Link>
              );
            })}
          </nav>
        </div>
      </div>
    </>
  );
}
