'use client';

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { interviewService } from '@/services/interviewService';
import { useFetch } from '@/hooks/useFetch';
import { formatDate, formatDateTime } from '@/utils/formatDate';
import { RoleGuard } from '@/middleware/roleGuard';
import Link from 'next/link';

export default function InterviewsPage() {
  const [statusFilter, setStatusFilter] = useState('all');
  
  const { 
    data: interviews, 
    loading, 
    error,
    refetch 
  } = useFetch(() => interviewService.getInterviews());

  const statuses = [
    { value: 'all', label: 'All Interviews' },
    { value: 'scheduled', label: 'Scheduled' },
    { value: 'completed', label: 'Completed' },
    { value: 'cancelled', label: 'Cancelled' },
    { value: 'rescheduled', label: 'Rescheduled' },
  ];

  const filteredInterviews = interviews?.filter((interview: any) => 
    statusFilter === 'all' || interview.status === statusFilter
  ) || [];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'scheduled': return 'bg-blue-100 text-blue-800';
      case 'completed': return 'bg-green-100 text-green-800';
      case 'cancelled': return 'bg-red-100 text-red-800';
      case 'rescheduled': return 'bg-yellow-100 text-yellow-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getResultColor = (result: string) => {
    switch (result) {
      case 'passed': return 'bg-green-100 text-green-800';
      case 'failed': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-64">
        <div className="text-gray-600">Loading interviews...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center text-red-600">
        Failed to load interviews: {error}
      </div>
    );
  }

  return (
    <RoleGuard allowedRoles={['admin', 'mentor']}>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Interviews</h1>
            <p className="text-gray-600">Schedule and manage applicant interviews</p>
          </div>
          <Button>
            Schedule Interview
          </Button>
        </div>

        {/* Filters */}
        <div className="sm:w-64">
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          >
            {statuses.map(status => (
              <option key={status.value} value={status.value}>
                {status.label}
              </option>
            ))}
          </select>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {statuses.slice(1).map(status => {
            const count = interviews?.filter((interview: any) => interview.status === status.value).length || 0;
            return (
              <Card key={status.value}>
                <CardContent className="pt-6">
                  <div className="text-2xl font-bold">{count}</div>
                  <p className="text-xs text-muted-foreground">{status.label}</p>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* Interviews List */}
        <div className="space-y-4">
          {filteredInterviews.length === 0 ? (
            <Card>
              <CardContent className="pt-6 text-center text-gray-500">
                No interviews found matching your criteria.
              </CardContent>
            </Card>
          ) : (
            filteredInterviews.map((interview: any) => (
              <Card key={interview._id}>
                <CardContent className="pt-6">
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-4 mb-3">
                        <div>
                          <h3 className="font-semibold text-gray-900">
                            Interview #{interview._id.slice(-6)}
                          </h3>
                          <p className="text-sm text-gray-600">
                            Applicant: {interview.applicantId}
                          </p>
                        </div>
                        <div className="flex gap-2">
                          <span className={`px-2 py-1 text-xs rounded-full ${getStatusColor(interview.status)}`}>
                            {interview.status.toUpperCase()}
                          </span>
                          {interview.result && (
                            <span className={`px-2 py-1 text-xs rounded-full ${getResultColor(interview.result)}`}>
                              {interview.result.toUpperCase()}
                            </span>
                          )}
                        </div>
                      </div>
                      
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm text-gray-600">
                        <div>
                          <span className="font-medium">Date & Time:</span>
                          <div className="ml-1">
                            {formatDateTime(`${interview.interviewDate}T${interview.interviewTime}`)}
                          </div>
                        </div>
                        <div>
                          <span className="font-medium">Interview Link:</span>
                          <div className="ml-1">
                            {interview.interviewLink ? (
                              <a 
                                href={interview.interviewLink} 
                                target="_blank" 
                                rel="noopener noreferrer"
                                className="text-blue-600 hover:underline"
                              >
                                Join Meeting
                              </a>
                            ) : (
                              'Not provided'
                            )}
                          </div>
                        </div>
                        <div>
                          <span className="font-medium">Scheduled:</span>
                          <div className="ml-1">{formatDate(interview.createdAt)}</div>
                        </div>
                      </div>

                      {interview.notes && (
                        <div className="mt-3 p-3 bg-gray-50 rounded-md">
                          <span className="text-sm font-medium text-gray-700">Notes:</span>
                          <p className="text-sm text-gray-600 mt-1">{interview.notes}</p>
                        </div>
                      )}

                      {interview.feedback && (
                        <div className="mt-3 p-3 bg-blue-50 rounded-md">
                          <span className="text-sm font-medium text-gray-700">Feedback:</span>
                          <p className="text-sm text-gray-600 mt-1">{interview.feedback}</p>
                        </div>
                      )}
                    </div>
                    
                    <div className="flex gap-2">
                      <Link href={`/lms/recruitment/interviews/${interview._id}`}>
                        <Button variant="outline" size="sm">
                          {interview.status === 'scheduled' ? 'Update' : 'View'}
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
