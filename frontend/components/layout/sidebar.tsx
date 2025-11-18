"use client";

import React, { useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/utils/cn";
import { useUser } from "@/hooks/useUser";

interface SidebarProps {
  className?: string;
  open?: boolean;
  onClose?: () => void;
}

export function Sidebar({ className, open = false, onClose }: SidebarProps) {
  const pathname = usePathname();
  const { user, isAdmin, isMentor, canManageRecruitment } = useUser();

  const navigation = [
    {
      name: "Dashboard",
      href: "/lms/dashboard",
      show: true,
    },
    {
      name: "Recruitment",
      href: "/lms/recruitment",
      show: canManageRecruitment,
      children: [
        { name: "Applications", href: "/lms/recruitment/applications" },
        { name: "Assessments", href: "/lms/recruitment/assessments" },
        { name: "Interviews", href: "/lms/recruitment/interviews" },
      ],
    },
    {
      name: "Tracks",
      href: "/lms/tracks",
      show: true,
    },
    {
      name: "Streams",
      href: "/lms/streams",
      show: true,
    },
    {
      name: "Emails",
      href: "/lms/emails",
      show: canManageRecruitment,
    },
  ];

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose && onClose();
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  return (
    <>
      {/* Desktop sidebar */}
      <aside
        className={cn(
          "h-full w-64 flex-col hidden md:flex bg-black",
          className
        )}
      >
        <div className="flex flex-col flex-1 min-h-0">
          <div className="flex items-center h-16 px-4 ">
            <h1 className="text-lg font-semibold text-gray-900">
              Uptick Talent
            </h1>
          </div>
          <nav className="flex-1 px-2 py-4 space-y-1">
            {navigation.map((item) => {
              if (!item.show) return null;

              if (item.children) {
                return (
                  <div key={item.name}>
                    <div className="px-3 py-2 text-sm font-medium text-gray-600">
                      {item.name}
                    </div>
                    {item.children.map((child) => (
                      <Link
                        key={child.href}
                        href={child.href}
                        className={cn(
                          "group flex items-center px-3 py-2 text-sm font-medium rounded-md ml-4",
                          pathname === child.href
                            ? "bg-blue-100 text-blue-700"
                            : "text-gray-600 hover:bg-gray-100 hover:text-gray-900"
                        )}
                      >
                        {child.name}
                      </Link>
                    ))}
                  </div>
                );
              }

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    "group flex items-center px-3 py-2 text-sm font-medium rounded-md",
                    pathname === item.href
                      ? "bg-blue-100 text-blue-700"
                      : "text-gray-600 hover:bg-gray-100 hover:text-gray-900"
                  )}
                >
                  {item.name}
                </Link>
              );
            })}
          </nav>
        </div>
      </aside>

      {/* Mobile drawer (always rendered so transitions work) */}
      <div
        className={cn(
          "md:hidden fixed inset-0 z-50 flex",
          open ? "pointer-events-auto" : "pointer-events-none"
        )}
        aria-hidden={!open}
      >
        {/* Backdrop */}
        <div
          className={cn(
            "fixed inset-0 bg-black/40 transition-opacity duration-200",
            open ? "opacity-100" : "opacity-0"
          )}
          onClick={() => onClose && onClose()}
        />

        <div
          className={cn(
            "relative w-64 h-full bg-white shadow-lg transform transition-transform duration-300 ease-in-out",
            open ? "translate-x-0" : "-translate-x-full"
          )}
        >
          <div className="flex items-center justify-between px-4 h-16 border-b">
            <h2 className="text-lg font-semibold">Uptick Talent</h2>
            <button
              className="p-2 rounded-md text-gray-600 hover:bg-gray-100"
              onClick={() => onClose && onClose()}
              aria-label="Close sidebar"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-5 w-5"
                viewBox="0 0 20 20"
                fill="currentColor"
              >
                <path
                  fillRule="evenodd"
                  d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 011.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
                  clipRule="evenodd"
                />
              </svg>
            </button>
          </div>

          <nav className="px-2 py-4 space-y-1 overflow-auto h-[calc(100%-64px)]">
            {navigation.map((item) => {
              if (!item.show) return null;

              if (item.children) {
                return (
                  <div key={item.name}>
                    <div className="px-3 py-2 text-sm font-medium text-gray-600">
                      {item.name}
                    </div>
                    {item.children.map((child) => (
                      <Link
                        key={child.href}
                        href={child.href}
                        onClick={() => onClose && onClose()}
                        className={cn(
                          "group flex items-center px-3 py-2 text-sm font-medium rounded-md ml-4",
                          pathname === child.href
                            ? "bg-blue-100 text-blue-700"
                            : "text-gray-600 hover:bg-gray-100 hover:text-gray-900"
                        )}
                      >
                        {child.name}
                      </Link>
                    ))}
                  </div>
                );
              }

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => onClose && onClose()}
                  className={cn(
                    "group flex items-center px-3 py-2 text-sm font-medium rounded-md",
                    pathname === item.href
                      ? "bg-blue-100 text-blue-700"
                      : "text-gray-600 hover:bg-gray-100 hover:text-gray-900"
                  )}
                >
                  {item.name}
                </Link>
              );
            })}
          </nav>
        </div>
      </div>
    </>
  );
}
