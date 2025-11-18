"use client";

import React from "react";
import { useParams, useRouter } from "next/navigation";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useFetch } from "@/hooks/useFetch";
import { applicantService } from "@/services/applicantService";
import { formatDateTime, formatDate } from "@/utils/formatDate";
import { toast } from "sonner";
import {
  ArrowLeft,
  Copy,
  ExternalLink,
  LoaderCircle,
  Mail,
} from "lucide-react";

export default function ApplicationDetail() {
  const params = useParams();
  const router = useRouter();
  const id = params?.id as string;

  const {
    data: application,
    loading,
    error,
    refetch,
  } = useFetch(() => applicantService.getApplication(id));

  const handleCopyCVLink = async () => {
    if (!application?.cvUrl) {
      toast.error("No CV available");
      return;
    }

    try {
      await navigator.clipboard.writeText(application.cvUrl);
      toast.success("CV link copied to clipboard");
    } catch (err) {
      toast.error("Could not copy CV link");
    }
  };

  const handleViewCV = () => {
    if (!application?.cvUrl) {
      toast.error("No CV available");
      return;
    }
    window.open(application.cvUrl, "_blank");
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-64">
        <div className="text-gray-600">
          <LoaderCircle className="text-indigo-600 animate-spin" />
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen p-4 sm:p-6 flex items-center justify-center">
        <div className="text-center max-w-md w-full">
          <div className="text-red-600 text-lg mb-4">⚠️</div>
          <h3 className="text-lg font-semibold mb-2">
            Failed to load application
          </h3>
          <p className="text-gray-600 mb-6 break-words">{error}</p>
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

  if (!application) {
    return (
      <div className="min-h-screen p-4 sm:p-6 flex items-center justify-center">
        <div className="text-center max-w-md w-full">
          <div className="text-gray-400 text-lg mb-4">📄</div>
          <h3 className="text-lg font-semibold mb-2">Application Not Found</h3>
          <p className="text-gray-600 mb-6">
            The application doesn&apos;t exist or may have been removed.
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
    applicant,
    cohort,
    cvUrl,
    tools,
    status,
    motivation,
    referralSource,
    submittedAt,
    reviewedAt,
  } = application;

  return (
    <div className="min-h-screen  bg-gray-50/30">
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
              Application Details
            </h1>
            <p className="text-gray-600 text-sm sm:text-base">
              Review application information
            </p>
          </div>
          <div className="px-3 py-1 rounded-full text-sm border capitalize w-fit">
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
              {applicant ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
                  <div className="space-y-3 sm:space-y-4">
                    <div>
                      <div className="text-sm text-gray-600">Full Name</div>
                      <div className="font-medium text-base sm:text-lg">
                        {applicant.firstName} {applicant.lastName}
                      </div>
                    </div>
                    <div>
                      <div className="text-sm text-gray-600">Email</div>
                      <a
                        href={`mailto:${applicant.email}`}
                        className="text-blue-600 hover:underline break-all"
                      >
                        {applicant.email}
                      </a>
                    </div>
                  </div>
                  <div className="space-y-3 sm:space-y-4">
                    <div>
                      <div className="text-sm text-gray-600">Phone</div>
                      <div className="break-all">
                        {applicant.phoneNumber || applicant.phone || "—"}
                      </div>
                    </div>
                    <div>
                      <div className="text-sm text-gray-600">Location</div>
                      <div>{applicant.state || applicant.country || "—"}</div>
                    </div>
                    <div>
                      <div className="text-sm text-gray-600">Member Since</div>
                      <div>
                        {applicant.createdAt
                          ? formatDate(applicant.createdAt)
                          : "—"}
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

          {/* Application Details */}
          <Card>
            <CardHeader className="pb-3 sm:pb-4">
              <CardTitle className="text-lg sm:text-xl">
                Application Details
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 sm:space-y-6">
              <div>
                <div className="text-sm text-gray-600 mb-2">Motivation</div>
                <p className="whitespace-pre-wrap text-sm sm:text-base ">
                  {motivation || "No motivation provided"}
                </p>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
                <div className="space-y-4 sm:space-y-6">
                  <div>
                    <div className="text-sm text-gray-600">Referral Source</div>
                    <div className="">{referralSource || "—"}</div>
                  </div>
                  <div>
                    <div className="text-sm text-gray-600 mb-2">
                      Tools & Technologies
                    </div>
                    <div>
                      {tools && tools.length > 0 ? (
                        <div className="flex flex-wrap gap-1.5">
                          {tools.map((tool: string, index: number) => (
                            <span
                              key={index}
                              className="px-2.5 py-1 text-xs bg-gray-100 rounded-full break-words"
                            >
                              {tool}
                            </span>
                          ))}
                        </div>
                      ) : (
                        <span className="text-gray-500">—</span>
                      )}
                    </div>
                  </div>
                </div>

                <div className="space-y-4 sm:space-y-6">
                  <div>
                    <div className="text-sm text-gray-600">Submitted</div>
                    <div className="text-sm sm:text-base">
                      {submittedAt ? formatDateTime(submittedAt) : "—"}
                    </div>
                  </div>
                  {reviewedAt && (
                    <div>
                      <div className="text-sm text-gray-600">Reviewed</div>
                      <div className="text-sm sm:text-base">
                        {formatDateTime(reviewedAt)}
                      </div>
                    </div>
                  )}
                  {cohort && (
                    <div>
                      <div className="text-sm text-gray-600">Cohort</div>
                      <div className="font-medium text-sm sm:text-base">
                        {cohort.name}
                      </div>
                      {cohort.startDate && cohort.endDate && (
                        <div className="text-sm text-gray-600">
                          {formatDate(cohort.startDate)} —{" "}
                          {formatDate(cohort.endDate)}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3 sm:pb-4">
              <CardTitle className="text-lg sm:text-xl">Actions</CardTitle>
            </CardHeader>

            <CardContent>
              <div className="flex flex-row flex-wrap gap-3 justify-center sm:justify-start">
                {cvUrl && (
                  <>
                    <Button
                      onClick={handleViewCV}
                      variant="outline"
                      className="flex items-center gap-2 w-40 h-10 justify-center"
                      size="sm"
                    >
                      <ExternalLink className="h-4 w-4" />
                      View CV
                    </Button>

                    <Button
                      onClick={handleCopyCVLink}
                      variant="outline"
                      className="flex items-center gap-2 w-40 h-10 justify-center"
                      size="sm"
                    >
                      <Copy className="h-4 w-4" />
                      Copy CV Link
                    </Button>
                  </>
                )}

                {applicant?.email && (
                  <Button
                    onClick={() =>
                      window.open(`mailto:${applicant.email}`, "_blank")
                    }
                    variant="outline"
                    className="flex items-center gap-2 w-40 h-10 justify-center"
                    size="sm"
                  >
                    <Mail className="h-4 w-4" />
                    Email Applicant
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
