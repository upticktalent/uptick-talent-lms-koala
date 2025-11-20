/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import Link from "next/link";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { lmsService } from "@/services/lmsService";
import { applicantService } from "@/services/applicantService";
import { trackService } from "@/services/trackService";
import { useFetch } from "@/hooks/useFetch";
import {
  Users,
  BookOpen,
  GraduationCap,
  ClipboardList,
  Clock,
  Sparkles,
  LayoutDashboard,
  Layers,
  Star,
  Target,
  Database,
  Mail,
  HardDrive,
  Activity,
  ArrowRight
} from "lucide-react";

import { DashboardCharts } from "@/components/shared/DashboardCharts";

export default function AdminDashboard() {
  const { data: dashboardStats, loading: statsLoading } = useFetch(() =>
    lmsService.getDashboardStats()
  );

  const { data: app } = useFetch(() => applicantService.getApplications());

  const applications = app?.applications;

  const { data: tracks } = useFetch(() => trackService.getTracks());

  const { data: cohorts } = useFetch(() => lmsService.getCohorts());

  const stats = {
    totalStudents: dashboardStats?.totalStudents || 0,
    totalTracks: tracks?.tracks?.length || 0,
    totalApplications: applications?.length || 0,
    activeCohorts: cohorts?.cohorts?.filter((c: any) => c.status==='active').length || 0,
    pendingApplications:
      applications?.filter((a: any) => a.status === "pending").length || 0,
    shortlistedApplicants:
      applications?.filter((a: any) => a.status === "shortlisted").length || 0,
  };

  const statCards = [
    {
      label: "Total Students",
      value: statsLoading ? "..." : stats.totalStudents,
      icon: Users,
      description: "Enrolled students",
      color: "text-blue-600",
      bgColor: "bg-blue-50",
    },
    {
      label: "Learning Tracks",
      value: stats.totalTracks,
      icon: BookOpen,
      description: "Available tracks",
      color: "text-green-600",
      bgColor: "bg-green-50",
    },
    {
      label: "Active Cohorts",
      value: stats.activeCohorts,
      icon: GraduationCap,
      description: "Currently running",
      color: "text-purple-600",
      bgColor: "bg-purple-50",
    },
    {
      label: "Total Applications",
      value: stats.totalApplications,
      icon: ClipboardList,
      description: "All time applications",
      color: "text-indigo-600",
      bgColor: "bg-indigo-50",
    },
    {
      label: "Pending Reviews",
      value: stats.pendingApplications,
      icon: Clock,
      description: "Need attention",
      color: "text-yellow-600",
      bgColor: "bg-yellow-50",
    },
    {
      label: "Shortlisted",
      value: stats.shortlistedApplicants,
      icon: Sparkles,
      description: "Ready for assessment",
      color: "text-pink-600",
      bgColor: "bg-pink-50",
    }
  ];

  const quickActions = [
    {
      title: "Manage Students",
      description: "View and manage all students in the system",
      href: "/admin/students",
      icon: Users,
      color: "text-blue-600",
      bgColor: "bg-blue-50",
    },
    {
      title: "Manage Tracks",
      description: "Create and configure learning tracks",
      href: "/admin/tracks",
      icon: BookOpen,
      color: "text-green-600",
      bgColor: "bg-green-50",
    },
    {
      title: "Manage Cohorts",
      description: "Create and manage cohort cycles",
      href: "/admin/cohorts",
      icon: Layers,
      color: "text-purple-600",
      bgColor: "bg-purple-50",
    },
    {
      title: "Active Cohort",
      description: "Manage the currently active cohort",
      href: "/admin/active-cohort",
      icon: Star,
      color: "text-orange-600",
      bgColor: "bg-orange-50",
    },
    {
      title: "Review Applications",
      description: "Process pending applications",
      href: "/lms/recruitment/applications",
      icon: ClipboardList,
      color: "text-red-600",
      bgColor: "bg-red-50",
    },
    {
      title: "LMS Dashboard",
      description: "Switch to LMS management view",
      href: "/lms/dashboard",
      icon: Target,
      color: "text-indigo-600",
      bgColor: "bg-indigo-50",
    },
  ];

  return (
    <div className="space-y-8">
      {/* Welcome Section */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Admin Dashboard</h1>
        <p className="text-gray-600 mt-2">
          Welcome to the system administration panel. Manage all aspects of
          Uptick Talent LMS.
        </p>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {statCards.map((stat, index) => {
          const Icon = stat.icon;
          return (
            <div
              key={index}
              className={`bg-white p-6 rounded-xl border border-slate-200 flex items-center justify-between`}
            >
              <div>
                <p className="text-sm font-medium text-slate-500 mb-1">
                  {stat.label}
                </p>
                <h3 className="text-3xl font-bold text-slate-900">
                  {stat.value}
                </h3>
                <p className="text-xs text-slate-400 mt-1">
                  {stat.description}
                </p>
              </div>
              <div className={`p-3 rounded-full ${stat.bgColor}`}>
                <Icon className={`w-6 h-6 ${stat.color}`} />
              </div>
            </div>
          );
        })}
      </div>



      {/* Analytics Charts */}
      <DashboardCharts applications={applications} />

      {/* Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
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
                    key={app?.applicant?._id}
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
                          {app?.applicant?.track}
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

        <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
          <div className="p-6 border-b border-slate-100">
            <h3 className="font-semibold text-gray-900">System Status</h3>
            <p className="text-sm text-gray-500">Current system health and status</p>
          </div>
          <div className="p-6">
            <div className="space-y-4">
              <div className="flex items-center justify-between p-3 bg-gray-50/50 rounded-lg">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-green-100 rounded-full text-green-600">
                    <Database className="w-4 h-4" />
                  </div>
                  <span className="text-sm font-medium text-gray-700">Database</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                  <span className="text-sm text-green-600 font-medium">Healthy</span>
                </div>
              </div>
              
              <div className="flex items-center justify-between p-3 bg-gray-50/50 rounded-lg">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-green-100 rounded-full text-green-600">
                    <Mail className="w-4 h-4" />
                  </div>
                  <span className="text-sm font-medium text-gray-700">Email Service</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                  <span className="text-sm text-green-600 font-medium">Operational</span>
                </div>
              </div>

              <div className="flex items-center justify-between p-3 bg-gray-50/50 rounded-lg">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-green-100 rounded-full text-green-600">
                    <HardDrive className="w-4 h-4" />
                  </div>
                  <span className="text-sm font-medium text-gray-700">File Storage</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                  <span className="text-sm text-green-600 font-medium">Available</span>
                </div>
              </div>

              <div className="flex items-center justify-between p-3 bg-gray-50/50 rounded-lg">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-yellow-100 rounded-full text-yellow-600">
                    <Activity className="w-4 h-4" />
                  </div>
                  <span className="text-sm font-medium text-gray-700">API Performance</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-yellow-500 rounded-full"></div>
                  <span className="text-sm text-yellow-600 font-medium">Moderate</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

