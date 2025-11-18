/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { applicantService } from "@/services/applicantService";
import { useFetch } from "@/hooks/useFetch";
import { formatDate } from "@/utils/formatDate";
import { RoleGuard } from "@/middleware/roleGuard";
import Link from "next/link";
import { LoaderCircle } from "lucide-react";

export default function ApplicationsPage() {
  const [statusFilter, setStatusFilter] = useState("all");
  const [searchTerm, setSearchTerm] = useState("");

  const {
    data: applications,
    loading,
    error,
  } = useFetch(() => applicantService.getApplications());

  console.log(applications);

  const statuses = [
    { value: "all", label: "All Applications" },
    { value: "pending", label: "Pending Review" },
    { value: "shortlisted", label: "Shortlisted" },
    { value: "assessment_submitted", label: "Assessment Submitted" },
    { value: "under_review", label: "Under Review" },
    { value: "interview_scheduled", label: "Interview Scheduled" },
    { value: "accepted", label: "Accepted" },
    { value: "rejected", label: "Rejected" },
  ];

  const filteredApplications =
    applications?.applications?.filter((app: any) => {
      const matchesStatus =
        statusFilter === "all" || app.status === statusFilter;
      const matchesSearch =
        !searchTerm ||
        `${app.applicant.firstName} ${app.applicant.lastName}`
          .toLowerCase()
          .includes(searchTerm.toLowerCase()) ||
        app.applicant.email.toLowerCase().includes(searchTerm.toLowerCase());

      return matchesStatus && matchesSearch;
    }) || [];

  const getStatusColor = (status: string) => {
    switch (status) {
      case "pending":
        return "bg-yellow-100 text-yellow-800";
      case "shortlisted":
        return "bg-blue-100 text-blue-800";
      case "assessment_submitted":
        return "bg-blue-100 text-blue-800";
      case "under_review":
        return "bg-purple-100 text-purple-800";
      case "interview_scheduled":
        return "bg-purple-100 text-purple-800";
      case "accepted":
        return "bg-green-100 text-green-800";
      case "rejected":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-64">
        <div className="text-gray-600">
          <LoaderCircle className="text-indigo-600 animate-spin w-8 h-8" />
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center text-red-600 p-4">
        Failed to load applications: {error}
      </div>
    );
  }

  return (
    <RoleGuard allowedRoles={["admin", "mentor"]}>
      <div className="space-y-6">
        {/* Header */}
        <div className="text-center sm:text-left">
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">
            Applications
          </h1>
          <p className="text-gray-600 mt-2 text-sm sm:text-base">
            Review and manage applicant submissions
          </p>
        </div>

        {/* Filters */}
        <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
          <div className="flex-1 min-w-0">
            <Input
              type="text"
              placeholder="Search by name or email..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full"
            />
          </div>
          <div className="w-full sm:w-48 lg:w-64">
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm sm:text-base"
            >
              {statuses.map((status) => (
                <option key={status.value} value={status.value}>
                  {status.label}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4">
          {statuses.slice(1).map((status) => {
            const count =
              applications?.applications?.filter(
                (app: any) => app.status === status.value
              ).length || 0;
            return (
              <Card key={status.value} className="overflow-hidden">
                <CardContent className="p-4 sm:p-6">
                  <div className="text-xl sm:text-2xl font-bold text-gray-900">
                    {count}
                  </div>
                  <p className="text-xs sm:text-sm text-muted-foreground mt-1 line-clamp-2">
                    {status.label}
                  </p>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* Applications List */}
        <div className="space-y-4">
          {filteredApplications.length === 0 ? (
            <Card>
              <CardContent className="p-6 sm:p-8 text-center text-gray-500">
                <p className="text-sm sm:text-base">
                  No applications found matching your criteria.
                </p>
              </CardContent>
            </Card>
          ) : (
            filteredApplications.map((application: any) => (
              <Card key={application._id} className="overflow-hidden">
                <CardContent className="p-4 sm:p-6">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div className="flex-1 min-w-0">
                      <div className="flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-4">
                        <div className="flex-1 min-w-0">
                          <h3 className="font-semibold text-gray-900 text-base sm:text-lg capitalize truncate">
                            {application.applicant.firstName}{" "}
                            {application.applicant.lastName}
                          </h3>
                          <p className="text-sm text-gray-600 truncate mt-1">
                            {application.applicant.email}
                          </p>
                        </div>
                        <div className="flex-shrink-0">
                          <span
                            className={`px-2 py-1 text-xs rounded-full ${getStatusColor(
                              application.status
                            )}`}
                          >
                            {application.status
                              .replace(/_/g, " ")
                              .toUpperCase()}
                          </span>
                        </div>
                      </div>

                      <div className="mt-3 sm:mt-4 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2 sm:gap-4 text-sm text-gray-600">
                        <div className="flex flex-col sm:flex-row">
                          <span className="font-medium text-xs sm:text-sm">
                            Preferred Track:
                          </span>
                          <span className="ml-0 sm:ml-1 capitalize text-xs sm:text-sm truncate">
                            {application.track.name}
                          </span>
                        </div>
                        <div className="flex flex-col sm:flex-row">
                          <span className="font-medium text-xs sm:text-sm">
                            Applied:
                          </span>
                          <span className="ml-0 sm:ml-1 text-xs sm:text-sm">
                            {formatDate(application.createdAt)}
                          </span>
                        </div>
                        <div className="flex flex-col sm:flex-row">
                          <span className="font-medium text-xs sm:text-sm">
                            Last Updated:
                          </span>
                          <span className="ml-0 sm:ml-1 text-xs sm:text-sm">
                            {formatDate(application.updatedAt)}
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="flex justify-end sm:justify-start pt-2 sm:pt-0">
                      <Link
                        href={`/lms/recruitment/applications/${application._id}`}
                        className="w-full sm:w-auto"
                      >
<<<<<<< HEAD
                        <Button
                          variant="outline"
                          size="sm"
                          className="w-full sm:w-auto"
                        >
=======
                        <Button variant='secondary' size='sm'>
>>>>>>> f009632f4612de641935e20fbc2873f81ca413b8
                          View Details
                        </Button>
                      </Link>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>
      </div>
    </RoleGuard>
  );
}
