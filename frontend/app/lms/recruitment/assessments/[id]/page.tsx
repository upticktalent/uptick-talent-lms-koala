/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import React from "react";
import { useParams, useRouter } from "next/navigation";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useFetch } from "@/hooks/useFetch";
import { assessmentService } from "@/services/assessmentService";
import { formatDateTime, formatDate } from "@/utils/formatDate";
import { toast } from "sonner";
import {
  ArrowLeft,
  Copy,
  ExternalLink,
  Mail,
  Download,
  FileText,
  Star,
} from "lucide-react";
import Loader from "@/components/Loader";

export default function AssessmentDetail() {
  const params = useParams();
  const router = useRouter();
  const id = params?.id as string;

  const {
    data: assessment,
    loading,
    error,
    refetch,
  } = useFetch(() => assessmentService.getAssessmentById(id));

  const handleCopyLink = async (url: string, type: string) => {
    try {
      await navigator.clipboard.writeText(url);
      toast.success(`${type} link copied to clipboard`);
    } catch (err) {
      toast.error(`Could not copy ${type} link`);
    }
  };

  const handleViewSubmission = (url: string) => {
    window.open(url, "_blank");
  };

  const handleDownloadFile = async (url: string, filename: string) => {
    try {
      const response = await fetch(url);
      const blob = await response.blob();
      const downloadUrl = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = downloadUrl;
      a.download = filename || "assessment-submission";
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(downloadUrl);
      toast.success("File downloaded successfully");
    } catch (err) {
      toast.error("Failed to download file");
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen p-4 sm:p-6 flex items-center justify-center">
        <Loader />
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen p-4 sm:p-6 flex items-center justify-center">
        <div className="text-center max-w-md w-full">
          <div className="text-red-600 text-lg mb-4">⚠️</div>
          <h3 className="text-lg font-semibold mb-2">
            Failed to load assessment
          </h3>
          <p className="text-gray-600 mb-6 wrap-break-word">{error}</p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Button onClick={() => refetch()} className="w-full sm:w-auto">
              Try Again
            </Button>
            <Button
              onClick={() => router.back()}
              variant="outline"
              className="w-full sm:w-auto"
            >
              Go Back
            </Button>
          </div>
        </div>
      </div>
    );
  }

  if (!assessment) {
    return (
      <div className="min-h-screen p-4 sm:p-6 flex items-center justify-center">
        <div className="text-center max-w-md w-full">
          <div className="text-gray-400 text-lg mb-4">📄</div>
          <h3 className="text-lg font-semibold mb-2">Assessment Not Found</h3>
          <p className="text-gray-600 mb-6">
            The assessment doesn&apos;t exist or may have been removed.
          </p>
          <Button
            onClick={() => router.back()}
            variant="outline"
            className="w-full sm:w-auto"
          >
            Go Back
          </Button>
        </div>
      </div>
    );
  }

  const {
    application,
    fileUrl,
    linkUrl,
    notes,
    status,
    submissionType,
    submittedAt,
    createdAt,
    updatedAt,
  } = assessment;

  const isSubmitted = status === "submitted";
  const isGraded = status === "graded";

  return (
    <div className="min-h-screen bg-gray-50/30">
      <div className="max-w-7xl mx-auto space-y-4 sm:space-y-6">
        {/* Header */}
        <div className="flex flex-col xs:flex-row xs:items-center gap-3 sm:gap-4">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => router.back()}
            className="flex items-center gap-2 w-fit cursor-pointer"
          >
            <ArrowLeft className="h-4 w-4" />
            <span className="sr-only sm:not-sr-only">Back</span>
          </Button>
          <div className="flex-1 min-w-0">
            <h1 className="text-2xl font-bold text-gray-900">
              Assessment Details
            </h1>
            <p className="text-gray-600 text-sm sm:text-base">
              Review and grade assessment submission
            </p>
          </div>
          <div
            className={`px-3 py-1 rounded-full text-sm border capitalize w-fit ${
              isSubmitted
                ? "bg-blue-100 text-blue-800 border-blue-200"
                : isGraded
                ? "bg-green-100 text-green-800 border-green-200"
                : "bg-gray-100 text-gray-800 border-gray-200"
            }`}
          >
            {status || "Unknown"}
          </div>
        </div>

        <div className="grid gap-4 sm:gap-6">
          {/* Applicant Information */}
          <Card>
            <CardHeader className="pb-3 sm:pb-4">
              <CardTitle className="text-lg sm:text-xl">
                Applicant Information
              </CardTitle>
            </CardHeader>
            <CardContent>
              {application?.applicant ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
                  <div className="space-y-3 sm:space-y-4">
                    <div>
                      <div className="text-sm text-gray-600">Full Name</div>
                      <div className="font-medium text-base sm:text-lg">
                        {application.applicant.firstName}{" "}
                        {application.applicant.lastName}
                      </div>
                    </div>
                    <div>
                      <div className="text-sm text-gray-600">Email</div>
                      <a
                        href={`mailto:${application.applicant.email}`}
                        className="text-blue-600 hover:underline break-all"
                      >
                        {application.applicant.email}
                      </a>
                    </div>
                  </div>
                  <div className="space-y-3 sm:space-y-4">
                    <div>
                      <div className="text-sm text-gray-600">Track</div>
                      <div className="font-medium capitalize">
                        {application.track?.name || "—"}
                      </div>
                    </div>
                    <div>
                      <div className="text-sm text-gray-600">Cohort</div>
                      <div className="capitalize">
                        {application.cohort?.name || "—"}
                      </div>
                    </div>
                    <div>
                      <div className="text-sm text-gray-600">
                        Application Status
                      </div>
                      <div className="capitalize">
                        {application.status || "—"}
                      </div>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="text-gray-500 text-center py-4">
                  No applicant information available
                </div>
              )}
            </CardContent>
          </Card>

          {/* Assessment Submission */}
          <Card>
            <CardHeader className="pb-3 sm:pb-4">
              <CardTitle className="text-lg sm:text-xl">
                Assessment Submission
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 sm:space-y-6">
              {/* Submission Type and Date */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
                <div className="space-y-4 sm:space-y-6">
                  <div>
                    <div className="text-sm text-gray-600">Submission Type</div>
                    <div className="capitalize">{submissionType || "—"}</div>
                  </div>
                  <div>
                    <div className="text-sm text-gray-600">Submitted</div>
                    <div className="text-sm sm:text-base">
                      {submittedAt
                        ? formatDateTime(submittedAt)
                        : "Not submitted"}
                    </div>
                  </div>
                </div>

                <div className="space-y-4 sm:space-y-6">
                  <div>
                    <div className="text-sm text-gray-600">Created</div>
                    <div className="text-sm sm:text-base">
                      {createdAt ? formatDateTime(createdAt) : "—"}
                    </div>
                  </div>
                  <div>
                    <div className="text-sm text-gray-600">Last Updated</div>
                    <div className="text-sm sm:text-base">
                      {updatedAt ? formatDateTime(updatedAt) : "—"}
                    </div>
                  </div>
                </div>
              </div>

              {/* File Submission */}
              {fileUrl && (
                <div>
                  <div className="text-sm text-gray-600 mb-3">
                    File Submission
                  </div>
                  <div className="flex flex-col sm:flex-row gap-3">
                    <Button
                      onClick={() => handleViewSubmission(fileUrl)}
                      variant="outline"
                      className="flex items-center gap-2 flex-1 sm:flex-none"
                      size="sm"
                    >
                      <ExternalLink className="h-4 w-4" />
                      View File
                    </Button>
                    <Button
                      onClick={() =>
                        handleDownloadFile(
                          fileUrl,
                          `assessment-${application?.applicant?.firstName}-submission`
                        )
                      }
                      variant="outline"
                      className="flex items-center gap-2 flex-1 sm:flex-none"
                      size="sm"
                    >
                      <Download className="h-4 w-4" />
                      Download
                    </Button>
                    <Button
                      onClick={() => handleCopyLink(fileUrl, "File")}
                      variant="outline"
                      className="flex items-center gap-2 flex-1 sm:flex-none"
                      size="sm"
                    >
                      <Copy className="h-4 w-4" />
                      Copy Link
                    </Button>
                  </div>
                </div>
              )}

              {/* Link Submission */}
              {linkUrl && (
                <div>
                  <div className="text-sm text-gray-600 mb-3">
                    Link Submission
                  </div>
                  <div className="flex flex-col sm:flex-row gap-3">
                    <Button
                      onClick={() => handleViewSubmission(linkUrl)}
                      variant="outline"
                      className="flex items-center gap-2 flex-1 sm:flex-none"
                      size="sm"
                    >
                      <ExternalLink className="h-4 w-4" />
                      Visit Link
                    </Button>
                    <Button
                      onClick={() => handleCopyLink(linkUrl, "Project")}
                      variant="outline"
                      className="flex items-center gap-2 flex-1 sm:flex-none"
                      size="sm"
                    >
                      <Copy className="h-4 w-4" />
                      Copy Link
                    </Button>
                  </div>
                </div>
              )}

              {/* Notes */}
              {notes && (
                <div>
                  <div className="text-sm text-gray-600 mb-2">
                    Applicant Notes
                  </div>
                  <div className="bg-gray-50 rounded-lg p-4">
                    <p className="whitespace-pre-wrap text-sm">{notes}</p>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Tools & Technologies */}
          {application?.tools && application.tools.length > 0 && (
            <Card>
              <CardHeader className="pb-3 sm:pb-4">
                <CardTitle className="text-lg sm:text-xl">
                  Tools & Technologies
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-2">
                  {application.tools.map((tool: string, index: number) => (
                    <span
                      key={index}
                      className="px-3 py-2 bg-blue-100 text-blue-800 rounded-full text-sm font-medium"
                    >
                      {tool}
                    </span>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Actions Card */}
          <Card>
            <CardHeader className="pb-3 sm:pb-4">
              <CardTitle className="text-lg sm:text-xl">
                Additional Actions
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-row flex-wrap gap-3 justify-center sm:justify-start">
                {application?.applicant?.email && (
                  <Button
                    onClick={() =>
                      window.open(
                        `mailto:${application.applicant.email}`,
                        "_blank"
                      )
                    }
                    variant="outline"
                    className="flex items-center gap-2 w-40 h-10 justify-center"
                    size="sm"
                  >
                    <Mail className="h-4 w-4" />
                    Email Applicant
                  </Button>
                )}

                <Button
                  onClick={() =>
                    router.push(
                      `/lms/recruitment/applications/${application?._id}`
                    )
                  }
                  variant="outline"
                  className="flex items-center gap-2 w-40 h-10 justify-center"
                  size="sm"
                >
                  <FileText className="h-4 w-4" />
                  View Application
                </Button>

                {application?.cvUrl && (
                  <Button
                    onClick={() => window.open(application.cvUrl, "_blank")}
                    variant="outline"
                    className="flex items-center gap-2 w-40 h-10 justify-center"
                    size="sm"
                  >
                    <ExternalLink className="h-4 w-4" />
                    View CV
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
