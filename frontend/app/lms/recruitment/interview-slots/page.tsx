'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { interviewSlotService } from '@/services/interviewSlotService';
import { trackService } from '@/services/trackService';
import { userService } from '@/services/userService';
import { formatDate, formatTime } from '@/utils/formatDate';
import { RoleGuard } from '@/middleware/roleGuard';
import Link from 'next/link';
import { Badge } from '@/components/ui/badge';
import { Calendar, Clock, Users, Plus, MoreHorizontal } from 'lucide-react';
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
import { Input } from '@/components/ui/input';

export default function InterviewSlotsPage() {
  const [dateFilter, setDateFilter] = useState('');
  const [interviewerFilter, setInterviewerFilter] = useState('all');
  const [trackFilter, setTrackFilter] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize] = useState(5);

  const [slots, setSlots] = useState<any[]>([]);
  const [tracks, setTracks] = useState<any[]>([]);
  const [interviewers, setInterviewers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchSlots = async () => {
    try {
      setLoading(true);
      setError(null);

      const params = {
        date: dateFilter || undefined,
        interviewer:
          interviewerFilter !== 'all' ? interviewerFilter : undefined,
        track: trackFilter !== 'all' ? trackFilter : undefined,
      };

      const response = await interviewSlotService.getAllSlots(params);

      if (response.data.success) {
        setSlots(response.data.data?.slots || []);
      } else {
        setError(response.data.message || 'Failed to fetch slots');
      }
    } catch (err: any) {
      setError(
        err.response?.data?.message || err.message || 'Failed to fetch slots'
      );
    } finally {
      setLoading(false);
    }
  };

  const fetchTracks = async () => {
    try {
      const response = await trackService.getActiveTracks();
      if (response.data.success) {
        const tracksData = response.data.data;
        setTracks(Array.isArray(tracksData) ? tracksData : []);
      }
    } catch (error) {
      console.error('Failed to fetch tracks:', error);
    }
  };

  const fetchInterviewers = async () => {
    try {
      const response = await userService.getAllUsers({
        role: ['admin', 'mentor'],
      });
      if (response.data.success) {
        setInterviewers(response.data.data || []);
      }
    } catch (error) {
      console.error('Failed to fetch interviewers:', error);
    }
  };

  useEffect(() => {
    fetchTracks();
    fetchInterviewers();
  }, []);

  useEffect(() => {
    fetchSlots();
    setCurrentPage(1);
  }, [dateFilter, interviewerFilter, trackFilter]);

  const refetch = () => {
    fetchSlots();
  };

  // Calculate statistics
  const totalSlots = slots.length;
  const availableSlots = slots.filter(
    (slot: any) => slot.isAvailable && slot.bookedCount < slot.maxInterviews
  ).length;
  const bookedSlots = slots.filter((slot: any) => slot.bookedCount > 0).length;
  const fullyBookedSlots = slots.filter(
    (slot: any) => slot.bookedCount >= slot.maxInterviews
  ).length;

  const getAvailabilityColor = (slot: any) => {
    const isActive = slot.isAvailable !== false;
    if (!isActive) return 'bg-gray-100 text-gray-800';
    if (slot.bookedCount >= slot.maxInterviews)
      return 'bg-red-100 text-red-800';
    if (slot.bookedCount > 0) return 'bg-yellow-100 text-yellow-800';
    return 'bg-green-100 text-green-800';
  };

  const getAvailabilityText = (slot: any) => {
    const isActive = slot.isAvailable !== false;
    if (!isActive) return 'Inactive';
    if (slot.bookedCount >= slot.maxInterviews) return 'Fully Booked';
    if (slot.bookedCount > 0) return 'Partially Booked';
    return 'Available';
  };

  // Pagination logic
  const totalItems = slots.length;
  const startIndex = (currentPage - 1) * pageSize;
  const paginatedSlots = slots.slice(startIndex, startIndex + pageSize);

  const handlePageChange = (newPage: number) => {
    setCurrentPage(newPage);
  };

  if (loading) {
    return <Loader text='Loading interview slots...' />;
  }

  if (error) {
    return (
      <div className='text-center text-red-600'>
        Failed to load interview slots: {error}
      </div>
    );
  }

  return (
    <RoleGuard allowedRoles={['admin', 'mentor']}>
      <div className='space-y-6'>
        {/* Header */}
        <div className='flex flex-col md:flex-row justify-between items-start md:items-center gap-4'>
          <div>
            <h1 className='text-2xl font-bold text-gray-900'>
              Interview Slots
            </h1>
            <p className='text-gray-600'>
              Manage mentor availability and interview scheduling
            </p>
          </div>
          <div className='flex gap-3 w-full md:w-auto'>
            <Link href='/lms/recruitment/interview-slots/create' className='w-full md:w-auto'>
              <Button className='w-full md:w-auto'>
                <Plus className='w-4 h-4 mr-2' />
                Create Slots
              </Button>
            </Link>
          </div>
        </div>

        {/* Statistics */}
        <div className='grid grid-cols-2 md:grid-cols-4 gap-4'>
          <Card>
            <CardContent className='pt-6'>
              <div className='flex items-center'>
                <Calendar className='h-4 w-4 text-muted-foreground' />
                <div className='ml-2'>
                  <div className='text-2xl font-bold'>{totalSlots}</div>
                  <p className='text-xs text-muted-foreground'>Total Slots</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className='pt-6'>
              <div className='flex items-center'>
                <Clock className='h-4 w-4 text-green-600' />
                <div className='ml-2'>
                  <div className='text-2xl font-bold text-green-600'>
                    {availableSlots}
                  </div>
                  <p className='text-xs text-muted-foreground'>Available</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className='pt-6'>
              <div className='flex items-center'>
                <Users className='h-4 w-4 text-yellow-600' />
                <div className='ml-2'>
                  <div className='text-2xl font-bold text-yellow-600'>
                    {bookedSlots}
                  </div>
                  <p className='text-xs text-muted-foreground'>Booked</p>
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
                    {fullyBookedSlots}
                  </div>
                  <p className='text-xs text-muted-foreground'>Full</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Filters */}
        <div className='flex flex-col md:flex-row gap-4'>
          <div className='w-full md:w-48'>
            <Input
              type='date'
              value={dateFilter}
              onChange={(e) => setDateFilter(e.target.value)}
              className='w-full'
              placeholder='Filter by date'
            />
          </div>

          <div className='w-full md:w-48'>
            <Select
              value={interviewerFilter}
              onValueChange={(value) => setInterviewerFilter(value)}
            >
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Filter by interviewer" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Interviewers</SelectItem>
                <SelectItem value="me">My Slots</SelectItem>
                {Array.isArray(interviewers) &&
                  interviewers.map((interviewer) => (
                    <SelectItem key={interviewer._id} value={interviewer._id}>
                      {interviewer.firstName} {interviewer.lastName} ({interviewer.role})
                    </SelectItem>
                  ))}
              </SelectContent>
            </Select>
          </div>

          <div className='w-full md:w-48'>
            <Select
              value={trackFilter}
              onValueChange={(value) => setTrackFilter(value)}
            >
              <SelectTrigger className="w-full">
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

          {(dateFilter ||
            interviewerFilter !== 'all' ||
            trackFilter !== 'all') && (
            <Button
              variant='secondary'
              onClick={() => {
                setDateFilter('');
                setInterviewerFilter('all');
                setTrackFilter('all');
              }}
              className="w-full md:w-auto"
            >
              Clear Filters
            </Button>
          )}
        </div>

        {/* Slots List */}
        <div className="space-y-4">
          {paginatedSlots.length === 0 ? (
            <div className="bg-white rounded-xl border-2 border-slate-200 p-8 text-center text-gray-500">
              <Calendar className='w-12 h-12 mx-auto mb-4 text-gray-300' />
              <h3 className='text-lg font-medium text-gray-900 mb-2'>
                No interview slots found
              </h3>
              <p className='text-gray-500 mb-4'>
                Create your first interview slots to start scheduling
                interviews.
              </p>
              <Link href='/lms/recruitment/interview-slots/create'>
                <Button>
                  <Plus className='w-4 h-4 mr-2' />
                  Create Slots
                </Button>
              </Link>
            </div>
          ) : (
            <>
              {/* Mobile Card View */}
              <div className="grid grid-cols-1 gap-4 md:hidden">
                {paginatedSlots.map((slot: any) => (
                  <Card key={slot._id} className="overflow-hidden">
                    <CardContent className="p-4">
                      <div className="flex justify-between items-start mb-3">
                        <div>
                          <div className="font-semibold text-gray-900">
                            {formatDate(slot.date)}
                          </div>
                          <div className="text-sm text-gray-500">
                            {formatTime(slot.startTime)} - {formatTime(slot.endTime)}
                          </div>
                        </div>
                        <Badge className={getAvailabilityColor(slot)}>
                          {getAvailabilityText(slot)}
                        </Badge>
                      </div>
                      
                      <div className="space-y-2 text-sm text-gray-600 mb-4">
                        <div className="flex justify-between">
                          <span className="text-gray-500">Interviewer:</span>
                          <span className="font-medium text-right">
                            {slot.interviewer?.firstName} {slot.interviewer?.lastName}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-500">Tracks:</span>
                          <span className="font-medium text-blue-600 text-right">
                            {slot.tracks && slot.tracks.length > 0 
                              ? slot.tracks.map((track: any) => track.name).join(', ')
                              : 'All Tracks'}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-500">Capacity:</span>
                          <span className="font-medium">
                            {slot.bookedCount} / {slot.maxInterviews}
                          </span>
                        </div>
                      </div>

                      <div className="flex gap-2">
                        <Link href={`/lms/recruitment/interview-slots/${slot._id}`} className="flex-1">
                          <Button variant="secondary" size="sm" className="w-full">
                            View
                          </Button>
                        </Link>
                        <Link href={`/lms/recruitment/interview-slots/${slot._id}/edit`} className="flex-1">
                          <Button variant="secondary" size="sm" className="w-full">
                            Edit
                          </Button>
                        </Link>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>

              {/* Desktop Table View */}
              <div className="hidden md:block bg-white rounded-xl border-2 border-slate-200 overflow-hidden">
                <Table>
                  <TableHeader className="bg-gray-50/50">
                    <TableRow>
                      <TableHead className="py-4 font-semibold text-gray-900">Date & Time</TableHead>
                      <TableHead className="py-4 font-semibold text-gray-900">Interviewer</TableHead>
                      <TableHead className="py-4 font-semibold text-gray-900">Tracks</TableHead>
                      <TableHead className="py-4 font-semibold text-gray-900">Capacity</TableHead>
                      <TableHead className="py-4 font-semibold text-gray-900">Status</TableHead>
                      <TableHead className="py-4 font-semibold text-gray-900 text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {paginatedSlots.map((slot: any) => (
                      <TableRow key={slot._id} className="hover:bg-gray-50/50 transition-colors">
                        <TableCell className="py-4">
                          <div>
                            <div className="font-semibold text-gray-900">
                              {formatDate(slot.date)}
                            </div>
                            <div className="text-sm text-gray-500">
                              {formatTime(slot.startTime)} - {formatTime(slot.endTime)}
                            </div>
                          </div>
                        </TableCell>
                        <TableCell className="py-4">
                          <div className="text-sm text-gray-700">
                            {slot.interviewer?.firstName} {slot.interviewer?.lastName}
                          </div>
                          <div className="text-xs text-gray-500 capitalize">
                            {slot.interviewer?.role}
                          </div>
                        </TableCell>
                        <TableCell className="py-4">
                          <div className="text-sm text-blue-600">
                            {slot.tracks && slot.tracks.length > 0 
                              ? slot.tracks.map((track: any) => track.name).join(', ')
                              : 'All Tracks'}
                          </div>
                        </TableCell>
                        <TableCell className="py-4">
                          <div className="text-sm text-gray-700">
                            {slot.bookedCount} / {slot.maxInterviews}
                          </div>
                        </TableCell>
                        <TableCell className="py-4">
                          <Badge className={getAvailabilityColor(slot)}>
                            {getAvailabilityText(slot)}
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
                              <Link href={`/lms/recruitment/interview-slots/${slot._id}`} className="w-full cursor-pointer">
                                <DropdownMenuItem className="cursor-pointer">
                                  View Details
                                </DropdownMenuItem>
                              </Link>
                              <Link href={`/lms/recruitment/interview-slots/${slot._id}/edit`} className="w-full cursor-pointer">
                                <DropdownMenuItem className="cursor-pointer">
                                  Edit
                                </DropdownMenuItem>
                              </Link>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </>
          )}
        </div>

        {/* Pagination */}
        {slots.length > 0 && (
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
