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
  FileText,
  ClipboardList,
  Calendar,
  Mail,
  Settings,
  ChevronRight,
  BookOpen,
  Megaphone,
  GraduationCap,
} from "lucide-react";
import { X } from "lucide-react";

interface SidebarProps {
  className?: string;
  open?: boolean;
  onClose?: () => void;
}

export function Sidebar({ className, open = false, onClose }: SidebarProps) {
  const pathname = usePathname();
  const { user, canManageRecruitment, isStudent } = useUser();

  const navigation = [
    {
      name: "Dashboard",
      href: "/lms/dashboard",
      icon: LayoutDashboard,
      show: canManageRecruitment,
    },
    {
      name: "Recruitment",
      href: "/lms/recruitment",
      icon: Users,
      show: canManageRecruitment,
      children: [
        {
          name: "Applications",
          href: "/lms/recruitment/applications",
          icon: FileText,
        },
        {
          name: "Assessments",
          href: "/lms/recruitment/assessments",
          icon: ClipboardList,
        },
        {
          name: "Interviews",
          href: "/lms/recruitment/interviews",
          icon: Calendar,
        },
      ],
    },
    {
      name: "Tracks",
      href: "/lms/tracks",
      icon: BookOpen,
      show: true,
    },
    {
      name: "Emails",
      href: "/lms/emails",
      icon: Mail,
      show: canManageRecruitment,
    },
    {
      name: "Stream",
      href: "/lms/stream",
      icon: BookOpen,
      show: isStudent,
    },
    {
      name: "Classwork",
      href: "/lms/classwork",
      icon: BookOpen,
      show: isStudent,
    },
    {
      name: "People",
      href: "/lms/people",
      icon: Users,
      show: isStudent,
    },
    {
      name: "Grades",
      href: "/lms/grades",
      icon: GraduationCap,
      show: isStudent,
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
    if (href === "/lms/dashboard") {
      return pathname === href;
    }
    return pathname.startsWith(href);
  };

  const isActiveChild = (childHref: string) => {
    return pathname === childHref;
  };

  return (
    <>
      {/* Desktop sidebar (clean & minimal) */}
      <aside
        className={cn(
          "sticky top-0 h-screen w-56 hidden lg:flex flex-col bg-[hsl(var(--card))] border-r border-[hsl(var(--border))]",
          className
        )}
      >
        <div className="flex flex-col flex-1 min-h-0">
          {/* Header */}
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

          {/* Navigation */}
          <nav className="flex-1 px-2 py-4 space-y-1">
            {navigation.map((item) => {
              if (!item.show) return null;

              const Icon = item.icon;
              const isActive = isActivePath(item.href);
              const hasChildren = item.children && item.children.length > 0;

              if (hasChildren) {
                return (
                  <div key={item.name} className="space-y-1">
                    <div className="px-3 py-1 text-xs font-medium text-gray-500">
                      <div className="flex items-center gap-2">
                        <Icon className="h-4 w-4 text-gray-400" />
                        <span>{item.name}</span>
                      </div>
                    </div>
                    <div className="space-y-1">
                      {item.children!.map((child) => {
                        const ChildIcon = child.icon;
                        const isChildActive = isActiveChild(child.href);

                        return (
                          <Link
                            key={child.href}
                            href={child.href}
                            className={cn(
                              "flex items-center px-3 py-2 text-sm rounded transition-colors",
                              isChildActive
                                ? "bg-blue-50 text-blue-700"
                                : "text-gray-700 hover:bg-gray-100"
                            )}
                          >
                            <ChildIcon
                              className={cn(
                                "h-5 w-5 mr-3",
                                isChildActive
                                  ? "text-blue-600"
                                  : "text-gray-400"
                              )}
                            />
                            <span className="truncate">{child.name}</span>
                          </Link>
                        );
                      })}
                    </div>
                  </div>
                );
              }

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

          {/* User info */}
          <div className="px-4 py-3 border-t border-[hsl(var(--border))]">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 bg-linear-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-medium">
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
              const hasChildren = item.children && item.children.length > 0;

              if (hasChildren) {
                return (
                  <div key={item.name} className="space-y-1">
                    <div className="px-3 py-1 text-xs font-medium text-gray-500 flex items-center gap-2">
                      <Icon className="h-4 w-4 text-gray-400" />
                      {item.name}
                    </div>
                    <div className="space-y-1">
                      {item.children!.map((child) => {
                        const isChildActive = isActiveChild(child.href);
                        return (
                          <Link
                            key={child.href}
                            href={child.href}
                            onClick={() => onClose && onClose()}
                            className={cn(
                              "flex items-center px-3 py-2 text-sm rounded transition-colors",
                              isChildActive
                                ? "bg-blue-50 text-blue-700"
                                : "text-gray-700 hover:bg-gray-100"
                            )}
                          >
                            <child.icon className="h-5 w-5 mr-3 text-gray-400" />
                            <span className="truncate">{child.name}</span>
                          </Link>
                        );
                      })}
                    </div>
                  </div>
                );
              }

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
