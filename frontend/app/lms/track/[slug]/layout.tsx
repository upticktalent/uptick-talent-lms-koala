"use client";

import { ReactNode } from "react";
import Link from "next/link";
import { usePathname, useParams } from "next/navigation";
import { trackService } from "@/services/trackService";
import { useFetch } from "@/hooks/useFetch";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/utils/cn";
import { LoadingSpinner } from "@/components/shared/LoadingSpinner";

export default function TrackLayout({ children }: { children: ReactNode }) {
  const params = useParams();
  const pathname = usePathname();
  const slug = params.slug as string;

  const { data: track, loading } = useFetch(() => trackService.getTrackBySlug(slug));

  const tabs = [
    { name: "Stream", href: `/lms/track/${slug}/stream` },
    { name: "Classwork", href: `/lms/track/${slug}/classwork` },
    { name: "People", href: `/lms/track/${slug}/people` },
    { name: "Grades", href: `/lms/track/${slug}/grades` },
  ];

  if (loading) {
    return <LoadingSpinner />;
  }

  if (!track) return <div>Track not found</div>;

  return (
    <div className="space-y-6">
      {/* Tabs */}
      <div className="sticky top-0 z-50 bg-white border-b border-gray-200">
        <nav className="-mb-px flex space-x-8 px-6 overflow-x-auto scrollbar-hide" aria-label="Tabs">
          {tabs.map((tab) => {
            const isActive = pathname === tab.href;
            return (
              <Link
                key={tab.name}
                href={tab.href}
                className={cn(
                  isActive
                    ? "border-blue-500 text-blue-600"
                    : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300",
                  "whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm transition-colors"
                )}
              >
                {tab.name}
              </Link>
            );
          })}
        </nav>
      </div>

      {/* Content */}
      <div>{children}</div>
    </div>
  );
}
