'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { interviewService } from '@/services/interviewService';
import { trackService } from '@/services/trackService';
import { formatDate, formatDateTime } from '@/utils/formatDate';
import { RoleGuard } from '@/middleware/roleGuard';
import Link from 'next/link';
import { Calendar, Clock, Users, MoreHorizontal, Filter } from 'lucide-react';
import Loader from '@/components/Loader';
import { CustomPagination as Pagination } from "@/components/shared/CustomPagination";
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
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Card, CardContent } from '@/components/ui/card';

export default function InterviewsPage() {
  const [statusFilter, setStatusFilter] = useState('all');
  const [trackFilter, setTrackFilter] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize] = useState(10);

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
    setCurrentPage(1);
  }, [statusFilter, trackFilter]);

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



  // Pagination logic
  const totalItems = interviews.length;
  const startIndex = (currentPage - 1) * pageSize;
  const paginatedInterviews = interviews.slice(startIndex, startIndex + pageSize);

  const handlePageChange = (newPage: number) => {
    setCurrentPage(newPage);
  };

  if (loading) {
    return <Loader text='Loading interviews...' />;
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
        <div className='flex gap-4 flex-wrap'>
          <div className='w-48'>
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
          <div className='w-48'>
            <Select
              value={trackFilter}
              onValueChange={(value) => setTrackFilter(value)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Filter by track" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Tracks</SelectItem>
                {Array.isArray(tracks) &&
                  tracks.map((track) => (
                    <SelectItem key={track._id} value={track._id}>
                      {track.name}
                    </SelectItem>
                  ))}
              </SelectContent>
            </Select>
          </div>
          {(statusFilter !== 'all' || trackFilter !== 'all') && (
            <Button
              variant='secondary'
              onClick={() => {
                setStatusFilter('all');
                setTrackFilter('all');
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

        {/* Interviews Table */}
        <div className="bg-white rounded-xl border-2 border-slate-200 overflow-hidden">
          {paginatedInterviews.length === 0 ? (
            <div className="p-8 text-center text-gray-500">
              <p>No interviews found matching your criteria.</p>
            </div>
          ) : (
            <Table>
              <TableHeader className="bg-gray-50/50">
                <TableRow>
                  <TableHead className="py-4 font-semibold text-gray-900">Applicant</TableHead>
                  <TableHead className="py-4 font-semibold text-gray-900">Interviewer</TableHead>
                  <TableHead className="py-4 font-semibold text-gray-900">Date & Time</TableHead>
                  <TableHead className="py-4 font-semibold text-gray-900">Status</TableHead>
                  <TableHead className="py-4 font-semibold text-gray-900 text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {paginatedInterviews.map((interview: any) => (
                  <TableRow key={interview._id} className="hover:bg-gray-50/50 transition-colors">
                    <TableCell className="py-4">
                      <div>
                        <div className="font-semibold text-gray-900 capitalize">
                          {interview.application?.applicant?.firstName} {interview.application?.applicant?.lastName}
                        </div>
                        <div className="text-sm text-gray-500">
                          Interview #{interview._id.slice(-6)}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell className="py-4">
                      <div className="text-sm text-gray-700">
                        {interview.interviewer?.firstName} {interview.interviewer?.lastName}
                      </div>
                    </TableCell>
                    <TableCell className="py-4">
                      <div className="text-sm text-gray-700">
                        {formatDateTime(`${interview.scheduledDate}`)}
                      </div>
                    </TableCell>
                    <TableCell className="py-4">
                      <Badge className={getStatusColor(interview.status)}>
                        {interview.status.toUpperCase()}
                      </Badge>
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
                              {interview.status === 'scheduled' ? 'Manage' : 'View Details'}
                            </DropdownMenuItem>
                          </Link>
                          {interview.status === 'scheduled' && (
                            <Link href={`/lms/recruitment/interviews/${interview._id}/edit`} className="w-full cursor-pointer">
                              <DropdownMenuItem className="cursor-pointer">
                                Edit
                              </DropdownMenuItem>
                            </Link>
                          )}
                          {interview.meetingLink && (
                            <a href={interview.meetingLink} target="_blank" rel="noopener noreferrer" className="w-full cursor-pointer">
                              <DropdownMenuItem className="cursor-pointer">
                                Join Meeting
                              </DropdownMenuItem>
                            </a>
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
        {interviews.length > 0 && (
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
