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
import { Search, Clock, CheckCircle, UserCheck, XCircle, AlertCircle, MoreHorizontal } from "lucide-react";
import { LoadingSpinner } from "@/components/shared/LoadingSpinner";
import { CustomPagination as Pagination } from "@/components/shared/CustomPagination";
import { toast } from "sonner";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

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
    return <LoadingSpinner />;
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
          <div className="flex-1 min-w-0 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-[hsl(var(--muted-foreground))]" />
            <Input
              type="text"
              placeholder="Search by name or email..."
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full pl-10"
            />
          </div>
          <div className="w-full sm:w-48 lg:w-64">
            <Select
              value={statusFilter}
              onValueChange={(value) => {
                setStatusFilter(value);
                setCurrentPage(1);
              }}
            >
              <SelectTrigger>
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                {statuses.map((status) => (
                  <SelectItem key={status.value} value={status.value}>
                    {status.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
          {statuses.slice(1).map((status) => {
            const count =
              applications?.applications?.filter(
                (app: any) => app.status === status.value
              ).length || 0;
            
            // Define icon and color for each status
            const getStatusConfig = (value: string) => {
              switch (value) {
                case "pending":
                  return {
                    icon: Clock,
                    iconBgColor: "bg-amber-100",
                    iconColor: "text-amber-600",
                    textColor: "text-amber-600",
                  };
                case "shortlisted":
                  return {
                    icon: UserCheck,
                    iconBgColor: "bg-blue-100",
                    iconColor: "text-blue-600",
                    textColor: "text-blue-600",
                  };
                case "under-review":
                  return {
                    icon: AlertCircle,
                    iconBgColor: "bg-purple-100",
                    iconColor: "text-purple-600",
                    textColor: "text-purple-600",
                  };
                case "accepted":
                  return {
                    icon: CheckCircle,
                    iconBgColor: "bg-green-100",
                    iconColor: "text-green-600",
                    textColor: "text-green-600",
                  };
                case "rejected":
                  return {
                    icon: XCircle,
                    iconBgColor: "bg-red-100",
                    iconColor: "text-red-600",
                    textColor: "text-red-600",
                  };
                default:
                  return {
                    icon: Clock,
                    iconBgColor: "bg-gray-100",
                    iconColor: "text-gray-600",
                    textColor: "text-gray-600",
                  };
              }
            };

            const config = getStatusConfig(status.value);
            const Icon = config.icon;

            return (
              <div
                key={status.value}
                className={`rounded-xl border border-slate-200 bg-white p-5 transition-all duration-200 hover:shadow-md cursor-pointer`}
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <p className="text-sm font-medium text-muted-foreground mb-2">
                      {status.label}
                    </p>
                    <div className={`text-3xl font-bold ${config.textColor}`}>
                      {count}
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Applications List */}
        <div className="bg-white rounded-xl border-2 border-slate-200 overflow-hidden">
          {paginatedApplications.length === 0 ? (
            <div className="p-8 text-center text-gray-500">
              <p>No applications found matching your criteria.</p>
            </div>
          ) : (
            <Table>
              <TableHeader className="bg-gray-50/50">
                <TableRow>
                  <TableHead className="py-4 font-semibold text-gray-900">Applicant</TableHead>
                  <TableHead className="py-4 font-semibold text-gray-900">Track</TableHead>
                  <TableHead className="py-4 font-semibold text-gray-900">Status</TableHead>
                  <TableHead className="py-4 font-semibold text-gray-900">Applied</TableHead>
                  <TableHead className="py-4 font-semibold text-gray-900 text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {paginatedApplications.map((application: any) => (
                  <TableRow key={application._id} className="hover:bg-gray-50/50 transition-colors">
                    <TableCell className="py-4">
                      <div>
                        <div className="font-semibold text-gray-900 capitalize">
                          {application.applicant.firstName} {application.applicant.lastName}
                        </div>
                        <div className="text-sm text-gray-500">
                          {application.applicant.email}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell className="py-4">
                      <div className="capitalize font-medium text-gray-700">{application.track.name}</div>
                    </TableCell>
                    <TableCell className="py-4">
                      <span
                        className={`px-3 py-1 text-xs font-medium rounded-full border ${getStatusColor(
                          application.status
                        )}`}
                      >
                        {application.status.replace(/_/g, " ").toUpperCase()}
                      </span>
                    </TableCell>
                    <TableCell className="py-4">
                      <div className="text-sm text-gray-500">{formatDate(application.createdAt)}</div>
                    </TableCell>
                    <TableCell className="py-4 text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" className="h-8 w-8 p-0 cursor-pointer">
                            <span className="sr-only">Open menu</span>
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="w-[160px] bg-white">
                          <DropdownMenuLabel>Actions</DropdownMenuLabel>
                          <Link href={`/lms/recruitment/applications/${application._id}`} className="w-full cursor-pointer">
                            <DropdownMenuItem className="cursor-pointer">
                              View Details
                            </DropdownMenuItem>
                          </Link>
                          {application.status === "pending" && (
                            <>
                              <DropdownMenuSeparator />
                              <DropdownMenuItem 
                                onClick={() => handleShortlist(application._id)}
                                disabled={isPending}
                                className="cursor-pointer"
                              >
                                Shortlist
                              </DropdownMenuItem>
                              <DropdownMenuItem 
                                onClick={() => handleReject(application._id)}
                                disabled={isPending}
                                className="text-red-600 focus:text-red-600 cursor-pointer"
                              >
                                Reject
                              </DropdownMenuItem>
                            </>
                          )}
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
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
