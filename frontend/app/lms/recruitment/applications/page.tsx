'use client';

import { useState } from 'react';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { applicantService } from '@/services/applicantService';
import { useFetch } from '@/hooks/useFetch';
import { formatDate } from '@/utils/formatDate';
import { RoleGuard } from '@/middleware/roleGuard';
import Link from 'next/link';

export default function ApplicationsPage() {
  const [statusFilter, setStatusFilter] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');

  const {
    data: applications,
    loading,
    error,
    refetch,
  } = useFetch(() => applicantService.getApplications());

  const statuses = [
    { value: 'all', label: 'All Applications' },
    { value: 'pending', label: 'Pending Review' },
    { value: 'shortlisted', label: 'Shortlisted' },
    { value: 'assessment_submitted', label: 'Assessment Submitted' },
    { value: 'under_review', label: 'Under Review' },
    { value: 'interview_scheduled', label: 'Interview Scheduled' },
    { value: 'accepted', label: 'Accepted' },
    { value: 'rejected', label: 'Rejected' },
  ];

  const filteredApplications =
    applications?.filter((app: any) => {
      const matchesStatus =
        statusFilter === 'all' || app.status === statusFilter;
      const matchesSearch =
        !searchTerm ||
        `${app.firstName} ${app.lastName}`
          .toLowerCase()
          .includes(searchTerm.toLowerCase()) ||
        app.email.toLowerCase().includes(searchTerm.toLowerCase());

      return matchesStatus && matchesSearch;
    }) || [];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'shortlisted':
        return 'bg-blue-100 text-blue-800';
      case 'assessment_submitted':
        return 'bg-blue-100 text-blue-800';
      case 'under_review':
        return 'bg-purple-100 text-purple-800';
      case 'interview_scheduled':
        return 'bg-purple-100 text-purple-800';
      case 'accepted':
        return 'bg-green-100 text-green-800';
      case 'rejected':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  if (loading) {
    return (
      <div className='flex justify-center items-center min-h-64'>
        <div className='text-gray-600'>Loading applications...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className='text-center text-red-600'>
        Failed to load applications: {error}
      </div>
    );
  }

  return (
    <RoleGuard allowedRoles={['admin', 'mentor']}>
      <div className='space-y-6'>
        {/* Header */}
        <div>
          <h1 className='text-2xl font-bold text-gray-900'>Applications</h1>
          <p className='text-gray-600'>
            Review and manage applicant submissions
          </p>
        </div>

        {/* Filters */}
        <div className='flex flex-col sm:flex-row gap-4'>
          <div className='flex-1'>
            <Input
              type='text'
              placeholder='Search applications...'
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <div className='sm:w-64'>
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
        </div>

        {/* Stats */}
        <div className='grid grid-cols-2 md:grid-cols-4 gap-4'>
          {statuses.slice(1).map((status) => {
            const count =
              applications?.filter((app: any) => app.status === status.value)
                .length || 0;
            return (
              <Card key={status.value}>
                <CardContent className='pt-6'>
                  <div className='text-2xl font-bold'>{count}</div>
                  <p className='text-xs text-muted-foreground'>
                    {status.label}
                  </p>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* Applications List */}
        <div className='space-y-4'>
          {filteredApplications.length === 0 ? (
            <Card>
              <CardContent className='pt-6 text-center text-gray-500'>
                No applications found matching your criteria.
              </CardContent>
            </Card>
          ) : (
            filteredApplications.map((application: any) => (
              <Card key={application._id}>
                <CardContent className='pt-6'>
                  <div className='flex items-center justify-between'>
                    <div className='flex-1'>
                      <div className='flex items-center gap-4'>
                        <div>
                          <h3 className='font-semibold text-gray-900'>
                            {application.firstName} {application.lastName}
                          </h3>
                          <p className='text-sm text-gray-600'>
                            {application.email}
                          </p>
                        </div>
                        <span
                          className={`px-2 py-1 text-xs rounded-full ${getStatusColor(
                            application.status
                          )}`}
                        >
                          {application.status.replace('_', ' ').toUpperCase()}
                        </span>
                      </div>

                      <div className='mt-3 grid grid-cols-1 md:grid-cols-3 gap-4 text-sm text-gray-600'>
                        <div>
                          <span className='font-medium'>Preferred Track:</span>
                          <span className='ml-1 capitalize'>
                            {application.preferredTrack?.replace('-', ' ')}
                          </span>
                        </div>
                        <div>
                          <span className='font-medium'>Applied:</span>
                          <span className='ml-1'>
                            {formatDate(application.createdAt)}
                          </span>
                        </div>
                        <div>
                          <span className='font-medium'>Last Updated:</span>
                          <span className='ml-1'>
                            {formatDate(application.updatedAt)}
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className='flex gap-2'>
                      <Link
                        href={`/lms/recruitment/applications/${application._id}`}
                      >
                        <Button variant='secondary' size='sm'>
                          View Details
                        </Button>
                      </Link>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>
      </div>
    </RoleGuard>
  );
}
