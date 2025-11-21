"use client";

import React from "react";
import { useParams, useRouter } from "next/navigation";
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useFetch } from "@/hooks/useFetch";
import { applicantService } from "@/services/applicantService";
import { formatDateTime, formatDate } from "@/utils/formatDate";
import { toast } from "sonner";
import {
  ArrowLeft,
  Copy,
  ExternalLink,
  Mail,
  CheckCircle,
  XCircle,
  Github,
  Globe,
  Briefcase,
  GraduationCap,
  Calendar,
  MapPin,
  Phone,
  User,
  Clock,
  Target,
  Award,
  FileText
} from "lucide-react";
import Loader from "@/components/Loader";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";

export default function ApplicationDetail() {
  const params = useParams();
  const router = useRouter();
  const id = params?.id as string;

  const {
    data: application,
    loading,
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

  const handleShortlist = async () => {
    try {
      await applicantService.updateApplicationStatus(id, "shortlisted");
      toast.success("Application shortlisted");
      refetch();
    } catch (err) {
      toast.error("Failed to shortlist application");
      console.error(err);
    }
  };

  const handleReject = async () => {
    try {
      await applicantService.updateApplicationStatus(id, "rejected");
      toast.success("Application rejected");
      refetch();
    } catch (err) {
      toast.error("Failed to reject application");
      console.error(err);
    }
  };

  if (loading) {
    return <Loader />;
  }

  if (!application) {
    return (
      <div className="min-h-screen p-4 sm:p-6 flex items-center justify-center bg-gray-50">
        <div className="text-center max-w-md w-full">
          <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <FileText className="h-8 w-8 text-gray-400" />
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">Application Not Found</h3>
            <p className="text-gray-500 mb-6">
              The application you are looking for doesn't exist or may have been removed.
            </p>
            <Button
              onClick={() => router.back()}
              variant="outline"
              className="w-full"
            >
              Go Back
            </Button>
          </div>
        </div>
      </div>
    );
  }

  // Destructure new shape
  const {
    applicant,
    careerGoals,
    educationalBackground,
    yearsOfExperience,
    weeklyCommitment,
    githubLink,
    portfolioLink,
    
    // Application
    cohort,
    track,
    tools,
    motivation,
    referralSource,
    referralSourceOther,
    cvUrl,
    status,
    submittedAt,
    createdAt,
  } = application;

  const isPending = status === "pending" 
  const fullName = `${applicant?.firstName} ${applicant?.lastName}`;


  const getStatusColor = (status: string) => {
    switch (status?.toLowerCase()) {
      case 'shortlisted': return 'bg-green-100 text-green-700 border-green-200';
      case 'rejected': return 'bg-red-100 text-red-700 border-red-200';
      case 'pending': return 'bg-yellow-100 text-yellow-700 border-yellow-200';
      case 'under-review': return 'bg-blue-100 text-blue-700 border-blue-200';
      default: return 'bg-gray-100 text-gray-700 border-gray-200';
    }
  };

  return (
    <div className="min-h-screen bg-gray-50/50 ">
      <div className="max-w-6xl mx-auto space-y-6">
        {/* Top Navigation & Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => router.back()}
              className="h-10 w-10 rounded-full hover:bg-white hover:shadow-sm transition-all"
            >
              <ArrowLeft className="h-5 w-5 text-gray-600" />
            </Button>
            <div>
              <h1 className="text-2xl font-bold text-gray-900 tracking-tight">
                {fullName}
              </h1>
            </div>
          </div>
          
          <div className="flex items-center gap-3">
            <Badge className={`px-3 py-1 text-sm font-medium capitalize border ${getStatusColor(status)} shadow-none`}>
              {status?.replace('-', ' ') || "Unknown"}
            </Badge>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column - Main Info */}
          <div className="lg:col-span-2 space-y-6">
            
            {/* Quick Actions (Only if Pending/Under Review) */}
            {isPending && (
              <Card className="border-blue-100 bg-blue-50/30 shadow-sm">
                <CardHeader className="pb-2">
                  <CardTitle className="text-base font-semibold text-blue-900 flex items-center gap-2">
                    <Clock className="h-4 w-4" /> Review Actions
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex gap-3">
                  <Button
                   
                      onClick={handleShortlist}
                      className="bg-blue-600 hover:bg-blue-700 text-white flex-1 shadow-sm"
                    >
                      <CheckCircle className="h-4 w-4 mr-2" />
                      Shortlist Candidate
                    </Button>
                    <Button
                      onClick={handleReject}
                      variant="outline"
                      className="border-red-200 text-red-700 hover:bg-red-50 hover:text-red-800 hover:border-red-300 flex-1"
                    >
                      <XCircle className="h-4 w-4 mr-2" />
                      Reject
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Professional Profile */}
            <Card className="shadow-sm border-gray-200 overflow-hidden">
              <CardHeader className="bg-gray-50/50 border-b border-gray-100 pb-4">
                <div className="flex items-center gap-2 text-gray-900">
                  <User className="h-5 w-5 text-blue-600" />
                  <CardTitle className="text-lg">Professional Profile</CardTitle>
                </div>
              </CardHeader>
              <CardContent className="p-6 space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-1">
                    <label className="text-xs font-medium text-gray-500 uppercase tracking-wider">Experience</label>
                    <div className="flex items-center gap-2 text-gray-900 font-medium">
                      <Briefcase className="h-4 w-4 text-gray-400" />
                      {yearsOfExperience || "Not specified"}
                    </div>
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs font-medium text-gray-500 uppercase tracking-wider">Education</label>
                    <div className="flex items-center gap-2 text-gray-900 font-medium">
                      <GraduationCap className="h-4 w-4 text-gray-400" />
                      {educationalBackground || "Not specified"}
                    </div>
                  </div>
                </div>

                <Separator />

                <div className="space-y-3">
                  <label className="text-xs font-medium text-gray-500 uppercase tracking-wider flex items-center gap-2">
                    <Target className="h-3 w-3" /> Career Goals
                  </label>
                  <p className="text-gray-700 leading-relaxed bg-gray-50 p-4 rounded-lg border border-gray-100">
                    {careerGoals || "No career goals specified."}
                  </p>
                </div>

                <div className="space-y-3">
                  <label className="text-xs font-medium text-gray-500 uppercase tracking-wider flex items-center gap-2">
                    <Award className="h-3 w-3" /> Motivation
                  </label>
                  <p className="text-gray-700 leading-relaxed bg-gray-50 p-4 rounded-lg border border-gray-100">
                    {motivation || "No motivation provided."}
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* Technical Skills */}
            <Card className="shadow-sm border-gray-200">
              <CardHeader className="pb-3">
                <CardTitle className="text-base font-semibold flex items-center gap-2">
                  <Globe className="h-4 w-4 text-blue-600" />
                  Skills & Tools
                </CardTitle>
              </CardHeader>
              <CardContent>
                {tools && tools.length > 0 ? (
                  <div className="flex flex-wrap gap-2">
                    {tools.map((tool: string, index: number) => (
                      <Badge 
                        key={index} 
                        variant="secondary" 
                        className="px-3 py-1 bg-blue-50 text-blue-700 hover:bg-blue-100 border-blue-100"
                      >
                        {tool}
                      </Badge>
                    ))}
                  </div>
                ) : (
                  <p className="text-gray-500 italic">No tools listed</p>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Right Column - Sidebar Info */}
          <div className="space-y-6">
            
            {/* Contact Info */}
            <Card className="shadow-sm border-gray-200">
              <CardHeader className="pb-3 border-b border-gray-100">
                <CardTitle className="text-base font-semibold">Contact Details</CardTitle>
              </CardHeader>
              <CardContent className="pt-4 space-y-4">
                <div className="flex items-start gap-3">
                  <Mail className="h-4 w-4 text-gray-400 mt-1" />
                  <div className="flex-1 min-w-0">
                    <p className="text-xs text-gray-500">Email</p>
                    <a href={`mailto:${applicant?.email}`} className="text-sm font-medium text-blue-600 hover:underline truncate block">
                      {applicant?.email}
                    </a>
                  </div>
                </div>
                


              </CardContent>
            </Card>

            {/* Links & Documents */}
            <Card className="shadow-sm border-gray-200">
              <CardHeader className="pb-3 border-b border-gray-100">
                <CardTitle className="text-base font-semibold">Links & Documents</CardTitle>
              </CardHeader>
              <CardContent className="pt-4 space-y-3">
                {cvUrl && (
                  <div className="p-3 bg-gray-50 rounded-lg border border-gray-100 space-y-3">
                    <div className="flex items-center gap-2 text-sm font-medium text-gray-900">
                      <FileText className="h-4 w-4 text-gray-500" />
                      Curriculum Vitae
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                      <Button onClick={handleViewCV} size="sm" variant="outline" className="w-full text-xs h-8">
                        <ExternalLink className="h-3 w-3 mr-1.5" /> View
                      </Button>
                      <Button onClick={handleCopyCVLink} size="sm" variant="outline" className="w-full text-xs h-8">
                        <Copy className="h-3 w-3 mr-1.5" /> Copy Link
                      </Button>
                    </div>
                  </div>
                )}

                {githubLink && (
                  <a 
                    href={githubLink} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="flex items-center justify-between p-3 rounded-lg border border-gray-200 hover:bg-gray-50 transition-colors group"
                  >
                    <div className="flex items-center gap-2">
                      <Github className="h-4 w-4 text-gray-600" />
                      <span className="text-sm font-medium text-gray-700">GitHub Profile</span>
                    </div>
                    <ExternalLink className="h-3 w-3 text-gray-400 group-hover:text-gray-600" />
                  </a>
                )}

                {portfolioLink && (
                  <a 
                    href={portfolioLink} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="flex items-center justify-between p-3 rounded-lg border border-gray-200 hover:bg-gray-50 transition-colors group"
                  >
                    <div className="flex items-center gap-2">
                      <Globe className="h-4 w-4 text-gray-600" />
                      <span className="text-sm font-medium text-gray-700">Portfolio</span>
                    </div>
                    <ExternalLink className="h-3 w-3 text-gray-400 group-hover:text-gray-600" />
                  </a>
                )}
              </CardContent>
            </Card>

            {/* Application Meta */}
            <Card className="shadow-sm border-gray-200 bg-gray-50/50">
              <CardContent className="p-4 space-y-3">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">Cohort</span>
                  <span className="font-medium text-gray-900">{cohort?.name || "N/A"}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">Weekly Commitment</span>
                  <span className="font-medium text-gray-900 capitalize">{weeklyCommitment || "N/A"}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">Referral Source</span>
                  <span className="font-medium text-gray-900 capitalize">
                    {referralSource === 'other' ? referralSourceOther : referralSource || "N/A"}
                  </span>
                </div>
              </CardContent>
            </Card>

          </div>
        </div>
      </div>
    </div>
  );
}
