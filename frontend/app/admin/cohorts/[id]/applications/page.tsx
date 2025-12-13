"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
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
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Search,
  MoreVertical,
  Eye,
  ArrowLeft,
  Users,
  FileText,
  Calendar,
  Clock,
  CheckCircle,
  XCircle,
  AlertCircle,
} from "lucide-react";
import { applicationService } from "@/services/applicationService";
import { cohortService } from "@/services/cohortService";
import { IApplication, ICohort, ApiResponse } from "@/types";
import { toast } from "sonner";
import Loader from "@/components/Loader";

export default function CohortApplicationsPage() {
  const params = useParams();
  const cohortId = params.id as string;

  const [applications, setApplications] = useState<IApplication[]>([]);
  const [cohort, setCohort] = useState<ICohort | null>(null);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");

  useEffect(() => {
    if (cohortId) {
      fetchCohort();
      fetchApplications();
    }
  }, [cohortId]);

  const fetchCohort = async () => {
    try {
      const response: ApiResponse<ICohort> = await cohortService.getCohortById(
        cohortId
      );
      if (response.success) {
        setCohort(response.data || null);
      } else {
        toast.error("Failed to fetch cohort details");
      }
    } catch (error) {
      console.error("Error fetching cohort:", error);
      toast.error("Error fetching cohort details");
    }
  };

  const fetchApplications = async () => {
    try {
      const response: ApiResponse<IApplication[]> =
        await applicationService.getApplicationsByCohort(cohortId);
      console.log("Applications API response:", response);
      if (response.success && response.data) {
        const data = response.data;
        console.log(
          "Applications data:",
          data,
          "Type:",
          typeof data,
          "IsArray:",
          Array.isArray(data)
        );
        // Ensure we always set an array
        const applicationsArray = Array.isArray(data) ? data : [];
        setApplications(applicationsArray);
      } else {
        console.log("API call unsuccessful or no data");
        toast.error("Failed to fetch applications");
        setApplications([]);
      }
    } catch (error) {
      console.error("Error fetching applications:", error);
      toast.error("Error fetching applications");
      setApplications([]);
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "accepted":
        return "bg-green-100 text-green-800";
      case "rejected":
        return "bg-red-100 text-red-800";
      case "shortlisted":
        return "bg-blue-100 text-blue-800";
      case "under-review":
        return "bg-yellow-100 text-yellow-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "accepted":
        return <CheckCircle className="h-4 w-4" />;
      case "rejected":
        return <XCircle className="h-4 w-4" />;
      case "shortlisted":
        return <Clock className="h-4 w-4" />;
      case "under-review":
        return <AlertCircle className="h-4 w-4" />;
      default:
        return <FileText className="h-4 w-4" />;
    }
  };

  const getCohortStatusMessage = () => {
    if (!cohort) return null;

    switch (cohort.status) {
      case "upcoming":
        return (
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
            <div className="flex items-center gap-2">
              <Clock className="h-5 w-5 text-blue-600" />
              <div>
                <h3 className="font-medium text-blue-900">Upcoming Cohort</h3>
                <p className="text-sm text-blue-700">
                  This cohort is scheduled to start on{" "}
                  {new Date(cohort.startDate).toLocaleDateString()}.
                  Applications are{" "}
                  {new Date() < new Date(cohort.applicationDeadline)
                    ? "currently being accepted"
                    : "closed"}
                  .
                </p>
              </div>
            </div>
          </div>
        );
      case "active":
        return (
          <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-6">
            <div className="flex items-center gap-2">
              <CheckCircle className="h-5 w-5 text-green-600" />
              <div>
                <h3 className="font-medium text-green-900">Active Cohort</h3>
                <p className="text-sm text-green-700">
                  This cohort is currently active and running. You can view all
                  applications and their status.
                </p>
              </div>
            </div>
          </div>
        );
      case "completed":
        return (
          <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 mb-6">
            <div className="flex items-center gap-2">
              <CheckCircle className="h-5 w-5 text-gray-600" />
              <div>
                <h3 className="font-medium text-gray-900">Completed Cohort</h3>
                <p className="text-sm text-gray-700">
                  This cohort has been completed. All application data,
                  recruitment details, track assignments, mentor information,
                  and LMS content are preserved for historical reference and
                  reporting.
                </p>
              </div>
            </div>
          </div>
        );
      case "cancelled":
        return (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
            <div className="flex items-center gap-2">
              <XCircle className="h-5 w-5 text-red-600" />
              <div>
                <h3 className="font-medium text-red-900">Cancelled Cohort</h3>
                <p className="text-sm text-red-700">
                  This cohort has been cancelled. Application data is preserved
                  for reference.
                </p>
              </div>
            </div>
          </div>
        );
      default:
        return null;
    }
  };

  const filteredApplications = Array.isArray(applications)
    ? applications.filter((app) => {
        const applicant =
          typeof app.applicant === "string" ? null : app.applicant;
        const matchesSearch =
          searchTerm === "" ||
          (applicant &&
            (applicant.firstName
              ?.toLowerCase()
              .includes(searchTerm.toLowerCase()) ||
              applicant.lastName
                ?.toLowerCase()
                .includes(searchTerm.toLowerCase()) ||
              applicant.email
                ?.toLowerCase()
                .includes(searchTerm.toLowerCase())));
        const matchesStatus =
          statusFilter === "all" || app.status === statusFilter;
        return matchesSearch && matchesStatus;
      })
    : [];

  const getApplicationStats = () => {
    const applicationsArray = Array.isArray(applications) ? applications : [];
    const stats = {
      total: applicationsArray.length,
      pending: applicationsArray.filter((app) => app.status === "under-review")
        .length,
      accepted: applicationsArray.filter((app) => app.status === "accepted")
        .length,
      rejected: applicationsArray.filter((app) => app.status === "rejected")
        .length,
      shortlisted: applicationsArray.filter(
        (app) => app.status === "shortlisted"
      ).length,
    };
    return stats;
  };

  if (loading) {
    return <Loader />;
  }

  const stats = getApplicationStats();

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link href="/admin/cohorts">
            <Button variant="ghost" size="sm">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Cohorts
            </Button>
          </Link>
          <div>
            <h1 className="text-3xl font-bold tracking-tight">
              Applications - {cohort?.name}
            </h1>
            <p className="text-muted-foreground">
              Manage recruitment applications specifically submitted for{" "}
              {cohort?.name} (Cohort #{cohort?.cohortNumber})
            </p>
          </div>
        </div>
      </div>

      {/* Cohort Status Message */}
      {getCohortStatusMessage()}

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Total Applications
            </CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.total}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Under Review</CardTitle>
            <AlertCircle className="h-4 w-4 text-yellow-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-600">
              {stats.pending}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Shortlisted</CardTitle>
            <Clock className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">
              {stats.shortlisted}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Accepted</CardTitle>
            <CheckCircle className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {stats.accepted}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Rejected</CardTitle>
            <XCircle className="h-4 w-4 text-red-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">
              {stats.rejected}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="flex-1">
          <div className="relative">
            <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
            <input
              placeholder="Search applications by name or email..."
              className="pl-8 w-full h-10 rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-full sm:w-[200px]">
            <SelectValue placeholder="Filter by status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Status</SelectItem>
            <SelectItem value="under-review">Under Review</SelectItem>
            <SelectItem value="shortlisted">Shortlisted</SelectItem>
            <SelectItem value="accepted">Accepted</SelectItem>
            <SelectItem value="rejected">Rejected</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Applications Table */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            Applications ({filteredApplications.length})
          </CardTitle>
          <CardDescription>
            {filteredApplications.length === 0
              ? "No applications found for this cohort"
              : `Showing ${filteredApplications.length} of ${applications.length} applications`}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {filteredApplications.length > 0 ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Applicant</TableHead>
                  <TableHead>Track</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Applied Date</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredApplications.map((application) => (
                  <TableRow key={application._id}>
                    <TableCell>
                      <div>
                        <div className="font-medium">
                          {typeof application.applicant === "string"
                            ? "Loading..."
                            : `${application.applicant?.firstName || ""} ${
                                application.applicant?.lastName || ""
                              }`.trim() || "N/A"}
                        </div>
                        <div className="text-sm text-muted-foreground">
                          {typeof application.applicant === "string"
                            ? "Loading..."
                            : application.applicant?.email || "N/A"}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline">
                        {typeof application.track === "string"
                          ? application.track
                          : application.track?.name || "N/A"}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Badge className={getStatusColor(application.status)}>
                        <span className="flex items-center gap-1">
                          {getStatusIcon(application.status)}
                          {application.status.replace("-", " ").toUpperCase()}
                        </span>
                      </Badge>
                    </TableCell>
                    <TableCell>
                      {new Date(application.createdAt).toLocaleDateString()}
                    </TableCell>
                    <TableCell>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" className="h-8 w-8 p-0">
                            <MoreVertical className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem asChild>
                            <Link
                              href={`/admin/applications/${application._id}`}
                            >
                              <Eye className="mr-2 h-4 w-4" />
                              View Details
                            </Link>
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          ) : (
            <div className="text-center py-12">
              <FileText className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
              <h3 className="text-lg font-medium text-muted-foreground mb-2">
                No applications found
              </h3>
              <p className="text-sm text-muted-foreground">
                {applications.length === 0
                  ? "This cohort has not received any applications yet."
                  : "Try adjusting your search or filter criteria."}
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
