'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { interviewService } from '@/services/interviewService';
import { useFetch } from '@/hooks/useFetch';
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

export default function InterviewsPage() {
  const [statusFilter, setStatusFilter] = useState('all');

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

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'scheduled':
        return 'bg-blue-100 text-blue-800';
      case 'completed':
        return 'bg-green-100 text-green-800';
      case 'cancelled':
        return 'bg-red-100 text-red-800';
      case 'rescheduled':
        return 'bg-yellow-100 text-yellow-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getResultColor = (result: string) => {
    switch (result) {
      case 'passed':
        return 'bg-green-100 text-green-800';
      case 'failed':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  if (loading) {
    return <LoadingSpinner />;
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
            <h1 className='text-2xl font-bold text-gray-900'>Interviews</h1>
            <p className='text-gray-600'>
              Schedule and manage applicant interviews
            </p>
          </div>
          <Button>Schedule Interview</Button>
        </div>

        {/* Filters */}
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
                      </div>
                    </TableCell>
                    <TableCell className="py-4">
                      <span
                        className={`px-3 py-1 text-xs font-medium rounded-full border ${getStatusColor(
                          interview.status
                        )}`}
                      >
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
