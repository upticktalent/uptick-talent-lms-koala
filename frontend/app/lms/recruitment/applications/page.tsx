/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useState, useTransition } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { applicantService } from "@/services/applicantService";
import { useFetch } from "@/hooks/useFetch";
import { formatDate } from "@/utils/formatDate";
import { RoleGuard } from "@/middleware/roleGuard";
import Link from "next/link";
import { LoaderCircle } from "lucide-react";
import { Pagination } from "@/components/ui/pagination";
import { toast } from "sonner";

export default function ApplicationsPage() {
  const [statusFilter, setStatusFilter] = useState("all");
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize] = useState(5);
  const [isPending, startTransition] = useTransition();

  const {
    data: applications,
    loading,
    error,
    refetch,
  } = useFetch(() => applicantService.getApplications());

  const statuses = [
    { value: "all", label: "All Applications" },
    { value: "pending", label: "Pending Review" },
    { value: "shortlisted", label: "Shortlisted" },
    { value: "under-review", label: "Under Review" },
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

  // Pagination logic
  const totalItems = filteredApplications.length;
  const startIndex = (currentPage - 1) * pageSize;
  const paginatedApplications = filteredApplications.slice(
    startIndex,
    startIndex + pageSize
  );

  const getStatusColor = (status: string) => {
    switch (status) {
      case "pending":
        return "bg-[hsl(var(--warning))]/10 text-[hsl(var(--warning))]";
      case "shortlisted":
        return "bg-[hsl(var(--info))]/10 text-[hsl(var(--info))]";
      case "assessment_submitted":
        return "bg-[hsl(var(--info))]/10 text-[hsl(var(--info))]";
      case "under_review":
        return "bg-[hsl(var(--accent))]/10 text-[hsl(var(--accent-foreground))]";
      case "interview_scheduled":
        return "bg-[hsl(var(--accent))]/10 text-[hsl(var(--accent-foreground))]";
      case "accepted":
        return "bg-[hsl(var(--success))]/10 text-[hsl(var(--success))]";
      case "rejected":
        return "bg-[hsl(var(--danger))]/10 text-[hsl(var(--danger))]";
      default:
        return "bg-[hsl(var(--muted))] text-[hsl(var(--muted-foreground))]";
    }
  };

  const handleShortlist = async (applicantId: string) => {
    try {
      startTransition(async () => {
        await applicantService.updateApplicationStatus(
          applicantId,
          "shortlisted"
        );
        toast.success("Applicant shortlisted successfully");
        refetch();
      });
    } catch (err) {
      toast.error("Failed to shortlist applicant");
      console.error("Failed to shortlist applicant:", err);
    }
  };

  const handleReject = async (applicantId: string) => {
    try {
      startTransition(async () => {
        await applicantService.updateApplicationStatus(applicantId, "rejected");
        toast.success("Applicant rejected successfully");
        refetch();
      });
    } catch (err) {
      toast.error("Failed to reject applicant");
      console.error("Failed to reject applicant:", err);
    }
  };

  const handlePageChange = (newPage: number) => {
    setCurrentPage(newPage);
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
              onChange={(e) => {
                setSearchTerm(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full"
            />
          </div>
          <div className="w-full sm:w-48 lg:w-64">
            <select
              value={statusFilter}
              onChange={(e) => {
                setStatusFilter(e.target.value);
                setCurrentPage(1); // Reset to first page when filtering
              }}
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
          {paginatedApplications.length === 0 ? (
            <Card>
              <CardContent className="p-6 sm:p-8 text-center text-gray-500">
                <p className="text-sm sm:text-base">
                  No applications found matching your criteria.
                </p>
              </CardContent>
            </Card>
          ) : (
            paginatedApplications.map((application: any) => (
              <Card key={application._id} className="overflow-hidden">
                <CardContent className="p-4 sm:p-6">
                  <div className="flex flex-col gap-4">
                    {/* Top Section: Basic Info & Status */}
                    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
                      <div className="flex-1 min-w-0">
                        <h3 className="font-semibold text-gray-900 text-lg capitalize">
                          {application.applicant.firstName}{" "}
                          {application.applicant.lastName}
                        </h3>
                        <p className="text-sm text-gray-600 mt-1 truncate">
                          {application.applicant.email}
                        </p>
                      </div>
                      <div className="shrink-0">
                        <span
                          className={`px-3 py-1 text-xs rounded-full ${getStatusColor(
                            application.status
                          )}`}
                        >
                          {application.status.replace(/_/g, " ").toUpperCase()}
                        </span>
                      </div>
                    </div>

                    {/* Middle Section: Application Details */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm text-gray-600">
                      <div className="space-y-1">
                        <div className="font-medium text-gray-900">Track</div>
                        <div className="capitalize">
                          {application.track.name}
                        </div>
                      </div>
                      <div className="space-y-1">
                        <div className="font-medium text-gray-900">Applied</div>
                        <div>{formatDate(application.createdAt)}</div>
                      </div>
                      <div className="space-y-1">
                        <div className="font-medium text-gray-900">
                          Last Updated
                        </div>
                        <div>{formatDate(application.updatedAt)}</div>
                      </div>
                    </div>

                    {/* Bottom Section: Actions */}
                    <div className="flex flex-col sm:flex-row gap-3 justify-between items-start sm:items-center pt-3 border-t">
                      <div className="flex-1">
                        {application.status === "pending" ? (
                          <div className="flex gap-2">
                            <Button
                              size="sm"
                              className="text-white cursor-pointer rounded-full"
                              onClick={() => handleShortlist(application._id)}
                            >
                              {isPending ? "Shortlisting..." : "Shortlist"}
                            </Button>
                            <Button
                              variant="danger"
                              size="sm"
                              className="text-white cursor-pointer rounded-full"
                              onClick={() => handleReject(application._id)}
                            >
                              {isPending ? "Rejecting..." : "Reject"}
                            </Button>
                          </div>
                        ) : (
                          <div className="text-sm text-gray-500">
                            Application {application.status.replace("_", " ")}
                          </div>
                        )}
                      </div>

                      <Link
                        href={`/lms/recruitment/applications/${application._id}`}
                      >
                        <Button variant="outline" size="sm">
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

        {/* Pagination */}
        {filteredApplications.length > 0 && (
          <Pagination
            page={currentPage}
            pageSize={pageSize}
            total={totalItems}
            onPageChange={handlePageChange}
          />
        )}
      </div>
    </RoleGuard>
  );
}
