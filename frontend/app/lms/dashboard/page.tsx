/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { ReactNode } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Users,
  BookOpen,
  FileText,
  ClipboardCheck,
  Megaphone,
  Rocket,
  ArrowRight,
} from "lucide-react";

import { DashboardCharts } from "@/components/shared/DashboardCharts";
import { lmsService } from "@/services/lmsService";
import { trackService } from "@/services/trackService";
import { applicantService } from "@/services/applicantService";
import { useUser } from "@/hooks/useUser";
import { useFetch } from "@/hooks/useFetch";
import { formatDate } from "@/utils/formatDate";
import { Skeleton } from "@/components/ui/skeleton";
import Link from "next/link";

type StatCardProps = {
  title: string;
  value: number;
  icon: ReactNode;
  trend?: string;
  loading?: boolean;
};

function StatCard({ title, value, icon, trend, loading }: StatCardProps) {
  return (
    <Card>
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="text-sm font-medium text-gray-600">
            {title}
          </CardTitle>
          {icon}
        </div>
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{loading ? '...' : value}</div>
      </CardContent>
    </Card>
  );
}

type QuickActionProps = {
  href: string;
  icon: ReactNode;
  title: string;
  badge?: number;
};

function QuickAction({ href, icon, title, badge }: QuickActionProps) {
  return (
    <Link href={href}>
      <Button
        variant="outline"
        className="w-full justify-start gap-3 h-12 cursor-pointer"
      >
        {icon}
        <span className="flex-1 text-left">{title}</span>
        {badge && <Badge variant="destructive">{badge}</Badge>}
        <ArrowRight className="h-4 w-4 text-gray-400" />
      </Button>
    </Link>
  );
}

export default function LMSDashboard() {
  const { user, isAdmin, isMentor, isStudent } = useUser();


  const { data, loading } = useFetch(() => applicantService.getApplications());
  
  const applications = data?.applications;
  
  const { data: allTracks, loading: tracksLoading } = useFetch(() =>
    trackService.getTracks()
  );
  const tracks = allTracks?.tracks;
  
  const { data: announcements, loading: announcementsLoading } = useFetch(() =>
    lmsService.getAnnouncements()
  );


  const stats =  {
    totalStudents: 0,
    totalTracks: tracks?.length || 0,
    activeApplications: applications?.filter((a: any) => a.status === 'pending').length || 0,
    pendingAssessments: applications?.filter((a: any) => a.status === 'shortlisted').length || 0,
  };

  const statsLoading = loading || tracksLoading;

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">
          Welcome back, {user?.firstName}!
        </h1>
        <p className="text-gray-600 mt-1">
          {isAdmin
            ? "System overview"
            : isMentor
            ? "Mentor dashboard"
            : "Learning dashboard"}
        </p>
      </div>

      {/* Stats */}
      {(isAdmin || isMentor) && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard
            title="Total Students"
            value={stats.totalStudents}
            icon={<Users className="h-4 w-4 text-blue-600" />}
            loading={statsLoading}
          />
          <StatCard
            title="Active Tracks"
            value={stats.totalTracks}
            icon={<BookOpen className="h-4 w-4 text-green-600" />}
            loading={statsLoading}
          />
          <StatCard
            title="Pending Applications"
            value={stats.activeApplications}
            icon={<FileText className="h-4 w-4 text-orange-600" />}
            loading={statsLoading}
          />
          <StatCard
            title="Pending Assessments"
            value={stats.pendingAssessments}
            icon={<ClipboardCheck className="h-4 w-4 text-purple-600" />}
            loading={statsLoading}
          />
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Announcements */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Megaphone className="h-5 w-5" />
              Recent Announcements
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {announcementsLoading ? (
              <div className="space-y-3">
                <Skeleton className="h-16 w-full" />
                <Skeleton className="h-16 w-full" />
              </div>
            ) : announcements?.length > 0 ? (
              announcements.slice(0, 3).map((announcement: any) => (
                <div
                  key={announcement._id}
                  className="border rounded-lg p-4"
                >
                  <h4 className="font-medium text-gray-900">
                    {announcement.title}
                  </h4>
                  <p className="text-sm text-gray-600 mt-1 line-clamp-2">
                    {announcement.content}
                  </p>
                  <p className="text-xs text-gray-500 mt-2">
                    {formatDate(announcement.createdAt)}
                  </p>
                </div>
              ))
            ) : (
              <p className="text-gray-500 text-center py-4">No announcements</p>
            )}
          </CardContent>
        </Card>

        {/* Quick Actions */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Rocket className="h-5 w-5" />
              Quick Actions
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 ">
            {isAdmin && (
              <div className="text-sm text-gray-600 flex flex-col gap-2">
                <QuickAction
                  href="/lms/recruitment/applications"
                  icon={<FileText className="h-4 w-4" />}
                  title="Review Applications"
                  badge={stats.activeApplications || undefined}
                />
                <QuickAction
                  href="/admin/tracks"
                  icon={<BookOpen className="h-4 w-4" />}
                  title="Manage Tracks"
                />
                <QuickAction
                  href="/admin/students"
                  icon={<Users className="h-4 w-4" />}
                  title="Manage Students"
                />
              </div>
            )}

            {isMentor && (
              <div className="text-sm text-gray-600 flex flex-col gap-2">
                <QuickAction
                  href="/lms/tracks"
                  icon={<BookOpen className="h-4 w-4" />}
                  title="View My Tracks"
                />
                <QuickAction
                  href="/lms/recruitment/applications"
                  icon={<FileText className="h-4 w-4" />}
                  title="Review Applications"
                />
              </div>
            )}

            {isStudent && tracks?.length > 0 && (
              <QuickAction
                href={`/lms/track/${tracks[0].slug}`}
                icon={<BookOpen className="h-4 w-4" />}
                title="Continue Learning"
              />
            )}

            <QuickAction
              href="/lms/tracks"
              icon={<BookOpen className="h-4 w-4" />}
              title="Browse All Tracks"
            />
          </CardContent>
        </Card>
      </div>

      {/* Student Tracks */}
      {isStudent && (
        <Card>
          <CardHeader>
            <CardTitle>My Learning Tracks</CardTitle>
          </CardHeader>
          <CardContent>
            {tracksLoading ? (
              <div className="space-y-4">
                <Skeleton className="h-20 w-full" />
                <Skeleton className="h-20 w-full" />
              </div>
            ) : tracks?.length > 0 ? (
              <div className="space-y-4">
                {tracks.map((track: any) => (
                  <div key={track._id} className="border rounded-lg p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <h4 className="font-medium text-gray-900">
                          {track.name}
                        </h4>
                        <p className="text-sm text-gray-600 mt-1">
                          {track.description}
                        </p>
                      </div>
                      <Link href={`/lms/track/${track.slug}`}>
                        <Button size="sm">Enter Track</Button>
                      </Link>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-gray-500 text-center py-4">
                Not enrolled in any tracks
              </p>
            )}
          </CardContent>
        </Card>
      )}
      {/* Analytics Charts for Admin/Mentor */}
      {(isAdmin || isMentor) && (
        <DashboardCharts applications={applications} />
      )}

      {/* Recent Applications for Admin/Mentor */}
      {(isAdmin || isMentor) && (
        <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
          <div className="p-6 border-b border-slate-100 flex justify-between items-center">
            <div>
              <h3 className="font-semibold text-gray-900">Recent Applications</h3>
              <p className="text-sm text-gray-500">Latest application submissions</p>
            </div>
            <Link href="/lms/recruitment/applications">
              <Button variant="ghost" size="sm" className="text-blue-600 hover:text-blue-700 hover:bg-blue-50">
                View All <ArrowRight className="w-4 h-4 ml-1" />
              </Button>
            </Link>
          </div>
          <div className="p-6">
            {applications && applications.length > 0 ? (
              <div className="space-y-4">
                {applications.slice(0, 5).map((app: any) => (
                  <div
                    key={app._id}
                    className="flex items-center justify-between p-3 hover:bg-gray-50 rounded-lg transition-colors border border-transparent hover:border-gray-100"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center text-gray-600 font-medium text-sm capitalize">
                        {app?.applicant?.firstName?.[0]}{app?.applicant?.lastName?.[0]}
                      </div>
                      <div>
                        <div className="font-medium text-gray-900 capitalize">
                          {app?.applicant?.firstName} {app?.applicant?.lastName}
                        </div>
                        <div className="text-xs text-gray-500 capitalize">
                          {app?.applicant?.track || app?.preferredTrack}
                        </div>
                      </div>
                    </div>
                    <span
                      className={`px-2.5 py-1 text-xs font-medium rounded-full ${
                        app.status === "pending"
                          ? "bg-yellow-50 text-yellow-700 border border-yellow-100"
                          : app.status === "shortlisted"
                          ? "bg-blue-50 text-blue-700 border border-blue-100"
                          : "bg-gray-50 text-gray-700 border border-gray-100"
                      }`}
                    >
                      {app.status.replace("_", " ").toUpperCase()}
                    </span>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-gray-500 text-center py-8">
                No recent applications found
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
