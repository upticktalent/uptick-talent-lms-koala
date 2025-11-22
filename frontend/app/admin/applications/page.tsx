'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Search,
  MoreVertical,
  Eye,
  Check,
  X,
  Clock,
  Users,
  FileText,
  Download,
  Filter,
  UserCheck,
  UserX,
  Star,
} from 'lucide-react';
import { applicationService } from '@/services/applicationService';
import { cohortService } from '@/services/cohortService';
import { trackService } from '@/services/trackService';
import { IApplication, ICohort, ITrack, ApiResponse } from '@/types';
import { toast } from 'sonner';
import Loader from '@/components/Loader';

export default function ApplicationsPage() {
  const [applications, setApplications] = useState<IApplication[]>([]);
  const [cohorts, setCohorts] = useState<ICohort[]>([]);
  const [tracks, setTracks] = useState<ITrack[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [cohortFilter, setCohortFilter] = useState<string>('all');
  const [trackFilter, setTrackFilter] = useState<string>('all');
  const [selectedApplication, setSelectedApplication] =
    useState<IApplication | null>(null);
  const [reviewDialogOpen, setReviewDialogOpen] = useState(false);
  const [reviewData, setReviewData] = useState<{
    status: 'under-review' | 'accepted' | 'rejected' | 'shortlisted';
    reviewNotes: string;
    rejectionReason: string;
  }>({
    status: 'under-review',
    reviewNotes: '',
    rejectionReason: '',
  });

  useEffect(() => {
    fetchApplications();
    fetchCohorts();
    fetchTracks();
  }, []);

  const fetchApplications = async () => {
    try {
      const response: any = await applicationService.getApplications();
      console.log(response);
      if (response.success) {
        setApplications(response.data.applications || []);
      } else {
        toast.error('Failed to fetch applications');
      }
    } catch (error) {
      toast.error('Error fetching applications');
    } finally {
      setLoading(false);
    }
  };

  const fetchCohorts = async () => {
    try {
      const response: any = await cohortService.getCohorts();
      if (response.success) {
        setCohorts(response.data.cohorts || []);
      }
      console.log(response);
    } catch (error) {
      console.error('Error fetching cohorts:', error);
    }
  };

  const fetchTracks = async () => {
    try {
      const response: any = await trackService.getTracks();
      if (response.success) {
        setTracks(response.data.tracks || []);
      }
    } catch (error) {
      console.error('Error fetching tracks:', error);
    }
  };

  const handleReviewApplication = async () => {
    if (!selectedApplication) return;

    try {
      const response: ApiResponse<IApplication> =
        await applicationService.reviewApplication(
          selectedApplication._id,
          reviewData
        );
      if (response.success) {
        toast.success('Application reviewed successfully');
        setReviewDialogOpen(false);
        setSelectedApplication(null);
        resetReviewData();
        fetchApplications();
      } else {
        toast.error(response.message || 'Failed to review application');
      }
    } catch (error: any) {
      toast.error(
        error.response?.data?.message || 'Error reviewing application'
      );
    }
  };

  const handleAcceptApplication = async (applicationId: string) => {
    try {
      const response = await applicationService.acceptApplication(
        applicationId
      );
      if (response.success) {
        toast.success('Application accepted and student account created');
        fetchApplications();
      } else {
        toast.error(response.message || 'Failed to accept application');
      }
    } catch (error: any) {
      toast.error(
        error.response?.data?.message || 'Error accepting application'
      );
    }
  };

  const handleShortlistApplication = async (applicationId: string) => {
    try {
      const response: ApiResponse<IApplication> =
        await applicationService.shortlistApplication(applicationId);
      if (response.success) {
        toast.success('Application shortlisted');
        fetchApplications();
      } else {
        toast.error(response.message || 'Failed to shortlist application');
      }
    } catch (error: any) {
      toast.error(
        error.response?.data?.message || 'Error shortlisting application'
      );
    }
  };

  const openReviewDialog = (
    application: IApplication,
    status: 'under-review' | 'accepted' | 'rejected' | 'shortlisted'
  ) => {
    setSelectedApplication(application);
    setReviewData({
      status,
      reviewNotes: '',
      rejectionReason: '',
    });
    setReviewDialogOpen(true);
  };

  const resetReviewData = () => {
    setReviewData({
      status: 'under-review',
      reviewNotes: '',
      rejectionReason: '',
    });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'under-review':
        return 'bg-blue-100 text-blue-800';
      case 'shortlisted':
        return 'bg-purple-100 text-purple-800';
      case 'accepted':
        return 'bg-green-100 text-green-800';
      case 'rejected':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pending':
        return <Clock className='h-4 w-4' />;
      case 'under-review':
        return <Eye className='h-4 w-4' />;
      case 'shortlisted':
        return <Star className='h-4 w-4' />;
      case 'accepted':
        return <Check className='h-4 w-4' />;
      case 'rejected':
        return <X className='h-4 w-4' />;
      default:
        return <Clock className='h-4 w-4' />;
    }
  };

  const filteredApplications = applications.filter((application) => {
    const applicant =
      typeof application.applicant === 'object' ? application.applicant : null;
    const cohort =
      typeof application.cohort === 'object' ? application.cohort : null;
    const track =
      typeof application.track === 'object' ? application.track : null;

    const matchesSearch =
      applicant &&
      (applicant.firstName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        applicant.lastName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        applicant.email.toLowerCase().includes(searchTerm.toLowerCase()));

    const matchesStatus =
      statusFilter === 'all' || application.status === statusFilter;
    const matchesCohort =
      cohortFilter === 'all' ||
      (typeof application.cohort === 'string'
        ? application.cohort === cohortFilter
        : application.cohort._id === cohortFilter);
    const matchesTrack =
      trackFilter === 'all' ||
      (typeof application.track === 'string'
        ? application.track === trackFilter
        : application.track._id === trackFilter);

    return matchesSearch && matchesStatus && matchesCohort && matchesTrack;
  });

  if (loading) {
    return <Loader />;
  }

  return (
    <div className='space-y-6'>
      {/* Header */}
      <div className='flex justify-between items-center'>
        <div>
          <h1 className='text-3xl font-bold tracking-tight'>Applications</h1>
          <p className='text-muted-foreground'>
            Review and manage student applications
          </p>
        </div>
        <div className='flex gap-2'>
          <Button variant='outline'>
            <Download className='h-4 w-4 mr-2' />
            Export
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className='grid gap-4 md:grid-cols-5'>
        <Card>
          <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
            <CardTitle className='text-sm font-medium'>
              Total Applications
            </CardTitle>
            <FileText className='h-4 w-4 text-muted-foreground' />
          </CardHeader>
          <CardContent>
            <div className='text-2xl font-bold'>{applications.length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
            <CardTitle className='text-sm font-medium'>Pending</CardTitle>
            <Clock className='h-4 w-4 text-muted-foreground' />
          </CardHeader>
          <CardContent>
            <div className='text-2xl font-bold'>
              {applications.filter((a) => a.status === 'pending').length}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
            <CardTitle className='text-sm font-medium'>Shortlisted</CardTitle>
            <Star className='h-4 w-4 text-muted-foreground' />
          </CardHeader>
          <CardContent>
            <div className='text-2xl font-bold'>
              {applications.filter((a) => a.status === 'shortlisted').length}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
            <CardTitle className='text-sm font-medium'>Accepted</CardTitle>
            <UserCheck className='h-4 w-4 text-muted-foreground' />
          </CardHeader>
          <CardContent>
            <div className='text-2xl font-bold'>
              {applications.filter((a) => a.status === 'accepted').length}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
            <CardTitle className='text-sm font-medium'>Rejected</CardTitle>
            <UserX className='h-4 w-4 text-muted-foreground' />
          </CardHeader>
          <CardContent>
            <div className='text-2xl font-bold'>
              {applications.filter((a) => a.status === 'rejected').length}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <div className='flex gap-4 flex-wrap'>
        <div className='relative flex-1 max-w-sm'>
          <Search className='absolute left-3 top-3 h-4 w-4 text-muted-foreground' />
          <Input
            placeholder='Search applications...'
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className='pl-10'
          />
        </div>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className='w-[180px]'>
            <SelectValue placeholder='Filter by status' />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value='all'>All Status</SelectItem>
            <SelectItem value='pending'>Pending</SelectItem>
            <SelectItem value='under-review'>Under Review</SelectItem>
            <SelectItem value='shortlisted'>Shortlisted</SelectItem>
            <SelectItem value='accepted'>Accepted</SelectItem>
            <SelectItem value='rejected'>Rejected</SelectItem>
          </SelectContent>
        </Select>
        <Select value={cohortFilter} onValueChange={setCohortFilter}>
          <SelectTrigger className='w-[180px]'>
            <SelectValue placeholder='Filter by cohort' />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value='all'>All Cohorts</SelectItem>
            {cohorts.map((cohort) => (
              <SelectItem key={cohort._id} value={cohort._id}>
                {cohort.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select value={trackFilter} onValueChange={setTrackFilter}>
          <SelectTrigger className='w-[180px]'>
            <SelectValue placeholder='Filter by track' />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value='all'>All Tracks</SelectItem>
            {tracks.map((track) => (
              <SelectItem key={track._id} value={track._id}>
                {track.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Applications Table */}
      <Card>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Applicant</TableHead>
              <TableHead>Cohort</TableHead>
              <TableHead>Track</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Experience</TableHead>
              <TableHead>Applied Date</TableHead>
              <TableHead className='text-right'>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredApplications.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={7}
                  className='text-center py-8 text-muted-foreground'
                >
                  No applications found
                </TableCell>
              </TableRow>
            ) : (
              filteredApplications.map((application) => {
                const applicant =
                  typeof application.applicant === 'object'
                    ? application.applicant
                    : null;
                const cohort =
                  typeof application.cohort === 'object'
                    ? application.cohort
                    : null;
                const track =
                  typeof application.track === 'object'
                    ? application.track
                    : null;

                return (
                  <TableRow key={application._id}>
                    <TableCell>
                      {applicant && (
                        <div>
                          <div className='font-medium'>
                            {applicant.firstName} {applicant.lastName}
                          </div>
                          <div className='text-sm text-muted-foreground'>
                            {applicant.email}
                          </div>
                        </div>
                      )}
                    </TableCell>
                    <TableCell>
                      <div className='text-sm'>
                        {cohort ? cohort.name : 'N/A'}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className='text-sm'>
                        {track ? track.name : 'N/A'}
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge
                        className={`${getStatusColor(
                          application.status
                        )} flex items-center gap-1 w-fit`}
                      >
                        {getStatusIcon(application.status)}
                        {application.status}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className='text-sm'>
                        {application.yearsOfExperience}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className='text-sm'>
                        {new Date(application.createdAt).toLocaleDateString()}
                      </div>
                    </TableCell>
                    <TableCell className='text-right'>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant='ghost' className='h-8 w-8 p-0'>
                            <MoreVertical className='h-4 w-4' />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align='end'>
                          <DropdownMenuItem asChild>
                            <Link
                              href={`/admin/applications/${application._id}`}
                            >
                              <Eye className='mr-2 h-4 w-4' />
                              View Details
                            </Link>
                          </DropdownMenuItem>
                          {application.status === 'pending' && (
                            <>
                              <DropdownMenuItem
                                onClick={() =>
                                  openReviewDialog(application, 'under-review')
                                }
                              >
                                <Eye className='mr-2 h-4 w-4' />
                                Review
                              </DropdownMenuItem>
                              <DropdownMenuItem
                                onClick={() =>
                                  handleShortlistApplication(application._id)
                                }
                              >
                                <Star className='mr-2 h-4 w-4' />
                                Shortlist
                              </DropdownMenuItem>
                            </>
                          )}
                          {(application.status === 'under-review' ||
                            application.status === 'shortlisted') && (
                            <>
                              <DropdownMenuItem
                                onClick={() =>
                                  handleAcceptApplication(application._id)
                                }
                              >
                                <Check className='mr-2 h-4 w-4' />
                                Accept
                              </DropdownMenuItem>
                              <DropdownMenuItem
                                onClick={() =>
                                  openReviewDialog(application, 'rejected')
                                }
                              >
                                <X className='mr-2 h-4 w-4' />
                                Reject
                              </DropdownMenuItem>
                            </>
                          )}
                          {application.cvUrl && (
                            <DropdownMenuItem asChild>
                              <a
                                href={application.cvUrl}
                                target='_blank'
                                rel='noopener noreferrer'
                              >
                                <Download className='mr-2 h-4 w-4' />
                                Download CV
                              </a>
                            </DropdownMenuItem>
                          )}
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                );
              })
            )}
          </TableBody>
        </Table>
      </Card>

      {/* Review Dialog */}
      <Dialog open={reviewDialogOpen} onOpenChange={setReviewDialogOpen}>
        <DialogContent className='sm:max-w-[500px]'>
          <DialogHeader>
            <DialogTitle>Review Application</DialogTitle>
            <DialogDescription>
              {selectedApplication && (
                <>
                  Review application from{' '}
                  {typeof selectedApplication.applicant === 'object'
                    ? `${selectedApplication.applicant.firstName} ${selectedApplication.applicant.lastName}`
                    : 'applicant'}
                </>
              )}
            </DialogDescription>
          </DialogHeader>
          <div className='grid gap-4 py-4'>
            <div className='space-y-2'>
              <Label>Status</Label>
              <Select
                value={reviewData.status}
                onValueChange={(
                  value:
                    | 'under-review'
                    | 'accepted'
                    | 'rejected'
                    | 'shortlisted'
                ) =>
                  setReviewData((prev) => ({
                    ...prev,
                    status: value,
                  }))
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder='Select status' />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value='under-review'>Under Review</SelectItem>
                  <SelectItem value='shortlisted'>Shortlisted</SelectItem>
                  <SelectItem value='accepted'>Accepted</SelectItem>
                  <SelectItem value='rejected'>Rejected</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className='space-y-2'>
              <Label htmlFor='reviewNotes'>Review Notes</Label>
              <Textarea
                id='reviewNotes'
                value={reviewData.reviewNotes}
                onChange={(e) =>
                  setReviewData((prev) => ({
                    ...prev,
                    reviewNotes: e.target.value,
                  }))
                }
                placeholder='Add your review notes...'
              />
            </div>
            {reviewData.status === 'rejected' && (
              <div className='space-y-2'>
                <Label htmlFor='rejectionReason'>Rejection Reason</Label>
                <Textarea
                  id='rejectionReason'
                  value={reviewData.rejectionReason}
                  onChange={(e) =>
                    setReviewData((prev) => ({
                      ...prev,
                      rejectionReason: e.target.value,
                    }))
                  }
                  placeholder='Reason for rejection...'
                />
              </div>
            )}
          </div>
          <DialogFooter>
            <Button
              variant='outline'
              onClick={() => setReviewDialogOpen(false)}
            >
              Cancel
            </Button>
            <Button onClick={handleReviewApplication}>Submit Review</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
