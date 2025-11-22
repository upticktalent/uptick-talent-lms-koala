'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  ArrowLeft,
  Download,
  User,
  Mail,
  Phone,
  Calendar,
  MapPin,
  GraduationCap,
  Briefcase,
  Clock,
  CheckCircle,
  XCircle,
  Eye,
} from 'lucide-react';
import { applicationService } from '@/services/applicationService';
import { IApplication } from '@/types';
import { formatDate } from '@/utils/formatDate';
import { handleApiError } from '@/utils/handleApiError';
import Loader from '@/components/Loader'
import { toast } from 'sonner';

export default function ApplicationDetailPage() {
  const params = useParams();
  const router = useRouter();
  const applicationId = params.id as string;

  const [application, setApplication] = useState<IApplication | null>(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [reviewDialog, setReviewDialog] = useState(false);
  const [reviewData, setReviewData] = useState({
    status: '',
    reviewNotes: '',
    rejectionReason: '',
  });

  useEffect(() => {
    fetchApplicationDetails();
  }, [applicationId]);

  const fetchApplicationDetails = async () => {
    try {
      setLoading(true);
      const response:any = await applicationService.getApplication(applicationId);
      if (response.success) {
        setApplication(response?.data);
      }
    } catch (error) {
      handleApiError(error);
    } finally {
      setLoading(false);
    }
  };

  const handleReviewSubmit = async () => {
    if (!reviewData.status) return;

    try {
      setActionLoading('review');
      const response:any = await applicationService.reviewApplication(
        applicationId,
        {
          status: reviewData.status as any,
          reviewNotes: reviewData.reviewNotes,
          rejectionReason: reviewData.rejectionReason,
        }
      );
      
      if (response.success) {
        setApplication(response?.data);
        setReviewDialog(false);
        setReviewData({ status: '', reviewNotes: '', rejectionReason: '' });
      }
    } catch (error) {
      handleApiError(error);
    } finally {
      setActionLoading(null);
    }
  };

  const handleQuickAction = async (action: 'accept' | 'reject' | 'shortlist') => {
    try {
      setActionLoading(action);
      let response;
      
      switch (action) {
        case 'accept':
          response = await applicationService.acceptApplication(applicationId);
          break;
        case 'reject':
          response = await applicationService.rejectApplication(applicationId);
          break;
        case 'shortlist':
          response = await applicationService.shortlistApplication(applicationId);
          break;
      }
      
      if (response?.success) {
        if (action === 'accept') {
          // Show success message with generated password
          toast(`Application accepted! Generated password: ${response?.data?.generatedPassword}`);
        }
        fetchApplicationDetails();
      }
    } catch (error) {
      handleApiError(error);
    } finally {
      setActionLoading(null);
    }
  };

  const getStatusBadgeVariant = (status: string) => {
    switch (status) {
      case 'accepted':
        return 'success';
      case 'rejected':
        return 'destructive';
      case 'under-review':
        return 'secondary';
      case 'shortlisted':
        return 'default';
      default:
        return 'outline';
    }
  };

  if (loading) {
    return <Loader />;
  }

  if (!application) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px]">
        <h2 className="text-2xl font-semibold mb-2">Application Not Found</h2>
        <p className="text-muted-foreground mb-4">
          The application you're looking for doesn't exist.
        </p>
        <Button onClick={() => router.back()}>
          <ArrowLeft className="w-4 h-4 mr-2" />
          Go Back
        </Button>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => router.back()}
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Applications
          </Button>
          <div>
            <h1 className="text-2xl font-bold">
              {typeof application.applicant === 'object' ? `${application.applicant.firstName} ${application.applicant.lastName}` : 'N/A'}
            </h1>
            <p className="text-muted-foreground">
              Applied on {formatDate(application.createdAt)}
            </p>
          </div>
        </div>
        
        <div className="flex items-center space-x-2">
          <Badge variant={getStatusBadgeVariant(application.status) as any}>
            {application.status}
          </Badge>
          {application.cvUrl && (
            <Button variant="outline" size="sm" asChild>
              <a href={application.cvUrl} target="_blank" rel="noopener noreferrer">
                <Download className="w-4 h-4 mr-2" />
                Download CV
              </a>
            </Button>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Personal Information */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <User className="w-5 h-5 mr-2" />
                Personal Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-sm font-medium">Full Name</Label>
                  <p className="text-sm">
                    {typeof application.applicant === 'object' ? `${application.applicant.firstName} ${application.applicant.lastName}` : 'N/A'}
                  </p>
                </div>
                <div>
                  <Label className="text-sm font-medium">Email</Label>
                  <p className="text-sm flex items-center">
                    <Mail className="w-4 h-4 mr-2" />
                    {typeof application.applicant === 'object' ? application.applicant.email : 'N/A'}
                  </p>
                </div>
                <div>
                  <Label className="text-sm font-medium">Phone</Label>
                  <p className="text-sm flex items-center">
                    <Phone className="w-4 h-4 mr-2" />
                    {typeof application.applicant === 'object' ? application.applicant.phoneNumber : 'N/A'}
                  </p>
                </div>
                <div>
                  <Label className="text-sm font-medium">Gender</Label>
                  <p className="text-sm">
                    {typeof application.applicant === 'object' ? application.applicant.gender : 'N/A'}
                  </p>
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-sm font-medium">Country</Label>
                  <p className="text-sm flex items-center">
                    <MapPin className="w-4 h-4 mr-2" />
                    {typeof application.applicant === 'object' ? application.applicant.country : 'N/A'}
                  </p>
                </div>
                <div>
                  <Label className="text-sm font-medium">State</Label>
                  <p className="text-sm">
                    {typeof application.applicant === 'object' ? application.applicant.state : 'N/A'}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Education */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <GraduationCap className="w-5 h-5 mr-2" />
                Education
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <Label className="text-sm font-medium">Educational Background</Label>
                  <p className="text-sm">{application.educationalBackground || application.educationalQualification || 'N/A'}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium">Years of Experience</Label>
                  <p className="text-sm">{application.yearsOfExperience || 'N/A'}</p>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label className="text-sm font-medium">GitHub Link</Label>
                    {application.githubLink ? (
                      <a href={application.githubLink} target="_blank" rel="noopener noreferrer" className="text-sm text-blue-600 hover:underline">
                        {application.githubLink}
                      </a>
                    ) : (
                      <p className="text-sm text-muted-foreground">Not provided</p>
                    )}
                  </div>
                  <div>
                    <Label className="text-sm font-medium">Portfolio Link</Label>
                    {application.portfolioLink ? (
                      <a href={application.portfolioLink} target="_blank" rel="noopener noreferrer" className="text-sm text-blue-600 hover:underline">
                        {application.portfolioLink}
                      </a>
                    ) : (
                      <p className="text-sm text-muted-foreground">Not provided</p>
                    )}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Career Goals */}
          {application.careerGoals && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Briefcase className="w-5 h-5 mr-2" />
                  Career Goals
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm whitespace-pre-wrap">{application.careerGoals}</p>
              </CardContent>
            </Card>
          )}

          {/* Tools and Technologies */}
          {application.tools && application.tools.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>Tools & Technologies</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-2">
                  {application.tools.map((tool, index) => (
                    <Badge key={index} variant="secondary">
                      {tool}
                    </Badge>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Motivation */}
          {application.motivation && (
            <Card>
              <CardHeader>
                <CardTitle>Motivation</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm whitespace-pre-wrap">{application.motivation}</p>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Application Details */}
          <Card>
            <CardHeader>
              <CardTitle>Application Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label className="text-sm font-medium">Track Applied For</Label>
                <p className="text-sm">{typeof application.track === 'object' ? application.track.name : 'N/A'}</p>
              </div>
              <div>
                <Label className="text-sm font-medium">Cohort</Label>
                <p className="text-sm">{typeof application.cohort === 'object' ? application.cohort.name : 'N/A'}</p>
              </div>
              <div>
                <Label className="text-sm font-medium">Weekly Commitment</Label>
                <p className="text-sm">{application.weeklyCommitment || 'N/A'}</p>
              </div>
              <div>
                <Label className="text-sm font-medium">Referral Source</Label>
                <p className="text-sm">{application.referralSource || 'N/A'}</p>
              </div>
              <div>
                <Label className="text-sm font-medium">Application Date</Label>
                <p className="text-sm flex items-center">
                  <Clock className="w-4 h-4 mr-2" />
                  {formatDate(application.createdAt)}
                </p>
              </div>
              {application.updatedAt !== application.createdAt && (
                <div>
                  <Label className="text-sm font-medium">Last Updated</Label>
                  <p className="text-sm flex items-center">
                    <Clock className="w-4 h-4 mr-2" />
                    {formatDate(application.updatedAt)}
                  </p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Review Information */}
          {(application.reviewNotes || application.rejectionReason) && (
            <Card>
              <CardHeader>
                <CardTitle>Review Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {application.reviewNotes && (
                  <div>
                    <Label className="text-sm font-medium">Review Notes</Label>
                    <p className="text-sm whitespace-pre-wrap">{application.reviewNotes}</p>
                  </div>
                )}
                {application.rejectionReason && (
                  <div>
                    <Label className="text-sm font-medium">Rejection Reason</Label>
                    <p className="text-sm whitespace-pre-wrap">{application.rejectionReason}</p>
                  </div>
                )}
              </CardContent>
            </Card>
          )}

          {/* Actions */}
          <Card>
            <CardHeader>
              <CardTitle>Actions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <Button
                className="w-full"
                onClick={() => setReviewDialog(true)}
                disabled={!!actionLoading}
              >
                <Eye className="w-4 h-4 mr-2" />
                Review Application
              </Button>
              
              {application.status === 'under-review' && (
                <Button
                  className="w-full"
                  variant="default"
                  onClick={() => handleQuickAction('accept')}
                  disabled={actionLoading === 'accept'}
                >
                  <CheckCircle className="w-4 h-4 mr-2" />
                  {actionLoading === 'accept' ? 'Accepting...' : 'Accept'}
                </Button>
              )}
              
              {application.status === 'pending' && (
                <Button
                  className="w-full"
                  variant="secondary"
                  onClick={() => handleQuickAction('shortlist')}
                  disabled={actionLoading === 'shortlist'}
                >
                  Shortlist
                </Button>
              )}
              
              {(application.status !== 'accepted' && application.status !== 'rejected') && (
                <Button
                  className="w-full"
                  variant="destructive"
                  onClick={() => handleQuickAction('reject')}
                  disabled={actionLoading === 'reject'}
                >
                  <XCircle className="w-4 h-4 mr-2" />
                  {actionLoading === 'reject' ? 'Rejecting...' : 'Reject'}
                </Button>
              )}
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Review Dialog */}
      <Dialog open={reviewDialog} onOpenChange={setReviewDialog}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Review Application</DialogTitle>
            <DialogDescription>
              Update the status and add review notes for this application.
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4">
            <div>
              <Label htmlFor="status">Status</Label>
              <Select
                value={reviewData.status}
                onValueChange={(value) =>
                  setReviewData({ ...reviewData, status: value })
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="under-review">Under Review</SelectItem>
                  <SelectItem value="shortlisted">Shortlisted</SelectItem>
                   <SelectItem value="rejected">Rejected</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="reviewNotes">Review Notes</Label>
              <Textarea
                id="reviewNotes"
                value={reviewData.reviewNotes}
                onChange={(e) =>
                  setReviewData({ ...reviewData, reviewNotes: e.target.value })
                }
                placeholder="Add any review notes..."
                rows={3}
              />
            </div>

            {reviewData.status === 'rejected' && (
              <div>
                <Label htmlFor="rejectionReason">Rejection Reason</Label>
                <Textarea
                  id="rejectionReason"
                  value={reviewData.rejectionReason}
                  onChange={(e) =>
                    setReviewData({
                      ...reviewData,
                      rejectionReason: e.target.value,
                    })
                  }
                  placeholder="Explain why this application was rejected..."
                  rows={3}
                />
              </div>
            )}
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setReviewDialog(false)}
              disabled={!!actionLoading}
            >
              Cancel
            </Button>
            <Button
              onClick={handleReviewSubmit}
              disabled={!reviewData.status || actionLoading === 'review'}
            >
              {actionLoading === 'review' ? 'Updating...' : 'Update Review'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}