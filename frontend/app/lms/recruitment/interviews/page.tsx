'use client';

<<<<<<< HEAD
import { useState } from 'react';
import { Button } from '@/components/ui/button';
=======
import { useState, useEffect } from 'react';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
>>>>>>> e9b8324af8cb2828cc9a08f44599923a76986833
import { interviewService } from '@/services/interviewService';
import { trackService } from '@/services/trackService';
import { useFetch } from '@/hooks/useFetch';
<<<<<<< HEAD
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Calendar, CheckCircle, XCircle, Clock, MoreHorizontal, Video } from 'lucide-react';
import { CustomPagination as Pagination } from "@/components/shared/CustomPagination";
import { toast } from "sonner";
import Link from 'next/link';
import { formatDate, formatDateTime } from '@/utils/formatDate';
import { RoleGuard } from '@/middleware/roleGuard';
import { LoadingSpinner } from '@/components/shared/LoadingSpinner';
=======
import { formatDate, formatDateTime, formatTime } from '@/utils/formatDate';
import { RoleGuard } from '@/middleware/roleGuard';
import Link from 'next/link';
import { Calendar, Clock, Users, Plus, Filter } from 'lucide-react';
import Loader from '@/components/Loader';
>>>>>>> e9b8324af8cb2828cc9a08f44599923a76986833

export default function InterviewsPage() {
  const [statusFilter, setStatusFilter] = useState('all');
  const [interviewerFilter, setInterviewerFilter] = useState('all');
  const [trackFilter, setTrackFilter] = useState('all');

<<<<<<< HEAD
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize] = useState(10);

  const {
    data: interviews,
    loading,
    error,
    refetch,
  } = useFetch(() => interviewService.getInterviews());

  const statuses = [
    { value: 'all', label: 'All Interviews', icon: Calendar, color: 'bg-blue-500', bgColor: 'bg-blue-50' },
    { value: 'scheduled', label: 'Scheduled', icon: Calendar, color: 'bg-amber-500', bgColor: 'bg-amber-50' },
    { value: 'completed', label: 'Completed', icon: CheckCircle, color: 'bg-green-500', bgColor: 'bg-green-50' },
    { value: 'cancelled', label: 'Cancelled', icon: XCircle, color: 'bg-red-500', bgColor: 'bg-red-50' },
    { value: 'rescheduled', label: 'Rescheduled', icon: Clock, color: 'bg-purple-500', bgColor: 'bg-purple-50' },
  ];

  const filteredInterviews =
    interviews?.filter(
      (interview: any) =>
        statusFilter === 'all' || interview.status === statusFilter
    ) || [];

  // Pagination logic
  const totalItems = filteredInterviews.length;
  const startIndex = (currentPage - 1) * pageSize;
  const paginatedInterviews = filteredInterviews.slice(
    startIndex,
    startIndex + pageSize
  );

  const handlePageChange = (newPage: number) => {
    setCurrentPage(newPage);
  };

=======
  const [interviews, setInterviews] = useState<any[]>([]);
  const [tracks, setTracks] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchInterviews = async () => {
    try {
      setLoading(true);
      setError(null);

      const params = {
        status: statusFilter !== 'all' ? statusFilter : undefined,
        interviewer:
          interviewerFilter !== 'all' ? interviewerFilter : undefined,
        track: trackFilter !== 'all' ? trackFilter : undefined,
      };

      const response = await interviewService.getInterviews(params);

      if (response.data.success) {
        setInterviews(response.data.data?.interviews || []);
      } else {
        setError(response.data.message || 'Failed to fetch interviews');
      }
    } catch (err: any) {
      setError(
        err.response?.data?.message ||
          err.message ||
          'Failed to fetch interviews'
      );
    } finally {
      setLoading(false);
    }
  };

  // Fetch interviews on component mount and when filters change
  useEffect(() => {
    fetchInterviews();
  }, [statusFilter, interviewerFilter, trackFilter]);

  const fetchTracks = async () => {
    try {
      const response = await trackService.getActiveTracks();

      if (response.data.success) {
        // getActiveTracks returns data directly as an array
        const tracksData = response.data.data;
        setTracks(Array.isArray(tracksData) ? tracksData : []);
      } else {
        setTracks([]);
      }
    } catch (error) {
      console.error('Failed to fetch tracks:', error);
      setTracks([]);
    }
  };

  // Fetch tracks on component mount
  useEffect(() => {
    fetchTracks();
  }, []);

  const refetch = () => {
    fetchInterviews();
  };

  const statuses = [
    { value: 'all', label: 'All Interviews' },
    { value: 'scheduled', label: 'Scheduled' },
    { value: 'interviewed', label: 'Interviewed' },
    { value: 'cancelled', label: 'Cancelled' },
  ];

>>>>>>> e9b8324af8cb2828cc9a08f44599923a76986833
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'scheduled':
        return 'bg-blue-100 text-blue-800';
      case 'interviewed':
        return 'bg-green-100 text-green-800';
      case 'cancelled':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getResultColor = (status: string) => {
    switch (status) {
      case 'interviewed':
        return 'bg-green-100 text-green-800';
      case 'cancelled':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  if (loading) {
<<<<<<< HEAD
    return <LoadingSpinner />;
=======
    return <Loader text='Loading interviews...' />;
>>>>>>> e9b8324af8cb2828cc9a08f44599923a76986833
  }

  if (error) {
    return (
      <div className='text-center text-red-600'>
        Failed to load interviews: {error}
      </div>
    );
  }

  return (
    <RoleGuard allowedRoles={['admin', 'mentor']}>
      <div className='space-y-6'>
        {/* Header */}
        <div className='flex justify-between items-center'>
          <div>
            <h1 className='text-2xl font-bold text-gray-900'>
              Interview Management
            </h1>
            <p className='text-gray-600'>
              Schedule, manage, and review applicant interviews
            </p>
          </div>
          <div className='flex gap-3'>
            <Link href='/lms/recruitment/interviews/schedule'>
              <Button variant='secondary'>
                <Users className='w-4 h-4 mr-2' />
                Public Schedule
              </Button>
            </Link>
            <Link href='/lms/recruitment/interview-slots'>
              <Button>
                <Calendar className='w-4 h-4 mr-2' />
                Manage Slots
              </Button>
            </Link>
          </div>
        </div>

        {/* Filters */}
<<<<<<< HEAD
        <div className='sm:w-64'>
          <Select
            value={statusFilter}
            onValueChange={(value) => setStatusFilter(value)}
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

        {/* Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {statuses.slice(1).map((status) => {
            const count =
              interviews?.filter(
                (interview: any) => interview.status === status.value
              ).length || 0;
            const Icon = status.icon;
            
            return (
              <div
                key={status.value}
                className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm flex items-center justify-between hover:shadow-md transition-shadow"
              >
                <div>
                  <p className="text-sm font-medium text-slate-500 mb-1">
                    {status.label}
                  </p>
                  <h3 className="text-3xl font-bold text-slate-900">
                    {count}
                  </h3>
                </div>
                <div className={`p-3 rounded-full ${status.bgColor}`}>
                  <Icon className={`w-6 h-6 ${status.color.replace('bg-', 'text-')}`} />
                </div>
              </div>
            );
          })}
        </div>

        {/* Interviews List */}
        <div className="bg-white rounded-xl border-2 border-slate-200 overflow-hidden">
          {!paginatedInterviews || paginatedInterviews.length === 0 ? (
            <div className="p-8 text-center text-gray-500">
              <p>No interviews found matching your criteria.</p>
            </div>
          ) : (
            <Table>
              <TableHeader className="bg-gray-50/50">
                <TableRow>
                  <TableHead className="py-4 font-semibold text-gray-900">Applicant</TableHead>
                  <TableHead className="py-4 font-semibold text-gray-900">Date & Time</TableHead>
                  <TableHead className="py-4 font-semibold text-gray-900">Status</TableHead>
                  <TableHead className="py-4 font-semibold text-gray-900">Link</TableHead>
                  <TableHead className="py-4 font-semibold text-gray-900 text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {paginatedInterviews.map((interview: any) => (
                  <TableRow key={interview._id} className="hover:bg-gray-50/50 transition-colors">
                    <TableCell className="py-4">
                      <div>
                        <div className="font-semibold text-gray-900">
                          Interview #{interview._id.slice(-6)}
                        </div>
                        <div className="text-sm text-gray-500">
                          ID: {interview.applicantId}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell className="py-4">
                      <div className="text-sm text-gray-700">
                        {formatDateTime(`${interview.interviewDate}T${interview.interviewTime}`)}
=======
        <div className='flex gap-4 flex-wrap'>
          <div className='w-48'>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className='w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500'
            >
              {statuses.map((status) => (
                <option key={status.value} value={status.value}>
                  {status.label}
                </option>
              ))}
            </select>
          </div>
          <div className='w-48'>
            <select
              value={trackFilter}
              onChange={(e) => setTrackFilter(e.target.value)}
              className='w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500'
            >
              <option value='all'>All Tracks</option>
              {Array.isArray(tracks) &&
                tracks.map((track) => (
                  <option key={track._id} value={track._id}>
                    {track.name}
                  </option>
                ))}
            </select>
          </div>
          {(statusFilter !== 'all' || trackFilter !== 'all') && (
            <Button
              variant='secondary'
              onClick={() => {
                setStatusFilter('all');
                setTrackFilter('all');
                // No need to call refetch here since useEffect will handle it
              }}
            >
              Clear Filters
            </Button>
          )}
        </div>

        {/* Stats */}
        <div className='grid grid-cols-2 md:grid-cols-4 gap-4'>
          <Card>
            <CardContent className='pt-6'>
              <div className='flex items-center'>
                <Calendar className='h-4 w-4 text-muted-foreground' />
                <div className='ml-2'>
                  <div className='text-2xl font-bold'>{interviews.length}</div>
                  <p className='text-xs text-muted-foreground'>
                    Total Interviews
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className='pt-6'>
              <div className='flex items-center'>
                <Clock className='h-4 w-4 text-blue-600' />
                <div className='ml-2'>
                  <div className='text-2xl font-bold text-blue-600'>
                    {
                      interviews.filter((i: any) => i.status === 'scheduled')
                        .length
                    }
                  </div>
                  <p className='text-xs text-muted-foreground'>Scheduled</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className='pt-6'>
              <div className='flex items-center'>
                <Users className='h-4 w-4 text-green-600' />
                <div className='ml-2'>
                  <div className='text-2xl font-bold text-green-600'>
                    {
                      interviews.filter((i: any) => i.status === 'interviewed')
                        .length
                    }
                  </div>
                  <p className='text-xs text-muted-foreground'>Interviewed</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className='pt-6'>
              <div className='flex items-center'>
                <Users className='h-4 w-4 text-red-600' />
                <div className='ml-2'>
                  <div className='text-2xl font-bold text-red-600'>
                    {
                      interviews.filter((i: any) => i.status === 'cancelled')
                        .length
                    }
                  </div>
                  <p className='text-xs text-muted-foreground'>Cancelled</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Interviews List */}
        <div className='space-y-4'>
          {interviews.length === 0 ? (
            <Card>
              <CardContent className='pt-6 text-center text-gray-500'>
                No interviews found matching your criteria.
              </CardContent>
            </Card>
          ) : (
            interviews.map((interview: any) => (
              <Card key={interview._id}>
                <CardContent className='pt-6'>
                  <div className='flex items-center justify-between'>
                    <div className='flex-1'>
                      <div className='flex items-center gap-4 mb-3'>
                        <div>
                          <h3 className='font-semibold text-gray-900'>
                            Interview #{interview._id.slice(-6)}
                          </h3>
                          <p className='text-sm text-gray-600'>
                            Applicant:{' '}
                            {interview.application?.applicant?.firstName}{' '}
                            {interview.application?.applicant?.lastName}
                          </p>
                          <p className='text-sm text-gray-500'>
                            Interviewer: {interview.interviewer?.firstName}{' '}
                            {interview.interviewer?.lastName}
                          </p>
                        </div>
                        <div className='flex gap-2'>
                          {interview.status && (
                            <Badge className={getResultColor(interview.status)}>
                              {interview.status.toUpperCase()}
                            </Badge>
                          )}
                          {interview.rating && (
                            <Badge variant='secondary'>
                              ⭐ {interview.rating}
                            </Badge>
                          )}
                        </div>
                      </div>

                      <div className='grid grid-cols-1 md:grid-cols-3 gap-4 text-sm text-gray-600'>
                        <div>
                          <span className='font-medium'>Date & Time:</span>
                          <div className='ml-1'>
                            {formatDateTime(`${interview.scheduledDate}`)}
                          </div>
                        </div>
                        <div>
                          <span className='font-medium'>Interview Link:</span>
                          <div className='ml-1'>
                            {interview.meetingLink ? (
                              <a
                                href={interview.meetingLink}
                                target='_blank'
                                rel='noopener noreferrer'
                                className='text-blue-600 hover:underline'
                              >
                                Join Meeting
                              </a>
                            ) : (
                              'Not provided'
                            )}
                          </div>
                        </div>
                        <div>
                          <span className='font-medium'>Scheduled:</span>
                          <div className='ml-1'>
                            {formatDate(interview.createdAt)}
                          </div>
                        </div>
>>>>>>> e9b8324af8cb2828cc9a08f44599923a76986833
                      </div>
                    </TableCell>
                    <TableCell className="py-4">
                      <span
                        className={`px-3 py-1 text-xs font-medium rounded-full border ${getStatusColor(
                          interview.status
                        )}`}
                      >
<<<<<<< HEAD
                        {interview.status.toUpperCase()}
                      </span>
                    </TableCell>
                    <TableCell className="py-4">
                      {interview.interviewLink ? (
                        <a
                          href={interview.interviewLink}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1 text-blue-600 hover:underline text-sm"
                        >
                          <Video className="w-3 h-3" />
                          Join
                        </a>
                      ) : (
                        <span className="text-gray-400 text-sm">Not provided</span>
                      )}
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
                          <Link href={`/lms/recruitment/interviews/${interview._id}`} className="w-full cursor-pointer">
                            <DropdownMenuItem className="cursor-pointer">
                              {interview.status === 'scheduled' ? 'Update Details' : 'View Details'}
                            </DropdownMenuItem>
                          </Link>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
=======
                        <Button variant='secondary' size='sm'>
                          {interview.status === 'scheduled'
                            ? 'Manage'
                            : 'View Details'}
                        </Button>
                      </Link>
                      {interview.status === 'scheduled' && (
                        <Link
                          href={`/lms/recruitment/interviews/${interview._id}/edit`}
                        >
                          <Button variant='secondary' size='sm'>
                            Edit
                          </Button>
                        </Link>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))
>>>>>>> e9b8324af8cb2828cc9a08f44599923a76986833
          )}
        </div>

        {/* Pagination */}
        {filteredInterviews.length > 0 && (
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
