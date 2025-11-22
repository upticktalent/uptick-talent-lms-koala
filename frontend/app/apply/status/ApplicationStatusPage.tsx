'use client';

import { useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { applicationService } from '@/services/applicationService';
import { handleApiError } from '@/utils/handleApiError';
import { formatDate } from '@/utils/formatDate';
import { IApplication } from '@/types';

export default function ApplicationStatusPage({
  applicantId,
}: {
  applicantId: string;
}) {
  const [applicant, setApplicant] = useState<IApplication | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (applicantId) {
      fetchApplicationStatus();
    }
  }, [applicantId]);

  const fetchApplicationStatus = async () => {
    try {
      const response = await applicationService.getApplicationStatus(
        applicantId!
      );
      if (response.data) {
        setApplicant(response.data);
      }
    } catch (err) {
      setError(handleApiError(err));
    } finally {
      setLoading(false);
    }
  };

  const getStatusInfo = (status: string) => {
    switch (status) {
      case 'pending':
        return {
          label: 'Application Submitted',
          description: 'Your application is under review.',
          color: 'bg-yellow-100 text-yellow-800',
        };
      case 'shortlisted':
        return {
          label: 'Shortlisted',
          description:
            'Congratulations! You have been shortlisted. Please check your email for the assessment link.',
          color: 'bg-blue-100 text-blue-800',
        };
      case 'assessment_submitted':
        return {
          label: 'Assessment Submitted',
          description:
            'Your assessment has been submitted and is being reviewed.',
          color: 'bg-blue-100 text-blue-800',
        };
      case 'under_review':
        return {
          label: 'Under Review',
          description:
            'Your application and assessment are being reviewed by our team.',
          color: 'bg-blue-100 text-blue-800',
        };
      case 'interview_scheduled':
        return {
          label: 'Interview Scheduled',
          description:
            'Your interview has been scheduled. Please check your email for details.',
          color: 'bg-purple-100 text-purple-800',
        };
      case 'accepted':
        return {
          label: 'Accepted',
          description:
            'Congratulations! You have been accepted. Welcome to Uptick Talent!',
          color: 'bg-green-100 text-green-800',
        };
      case 'rejected':
        return {
          label: 'Application Unsuccessful',
          description:
            'Unfortunately, your application was not successful this time. Thank you for your interest.',
          color: 'bg-red-100 text-red-800',
        };
      default:
        return {
          label: 'Unknown Status',
          description: 'Status information is not available.',
          color: 'bg-gray-100 text-gray-800',
        };
    }
  };

  if (loading) {
    return (
      <div className='flex justify-center items-center min-h-64'>
        <div className='text-gray-600'>Loading application status...</div>
      </div>
    );
  }

  if (error) {
    return (
      <Card>
        <CardContent className='pt-6'>
          <div className='text-center'>
            <div className='text-red-600 font-medium mb-2'>Error</div>
            <p className='text-gray-600 mb-4'>{error}</p>
            <Link href='/apply'>
              <Button variant='default'>Submit New Application</Button>
            </Link>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!applicant) {
    return (
      <Card>
        <CardContent className='pt-6'>
          <div className='text-center'>
            <div className='text-gray-600 font-medium mb-2'>
              Application Not Found
            </div>
            <p className='text-gray-600 mb-4'>
              We couldn&apos;t find your application. Please check the URL or
              submit a new application.
            </p>
            <Link href='/apply'>
              <Button variant='default'>Submit New Application</Button>
            </Link>
          </div>
        </CardContent>
      </Card>
    );
  }

  const statusInfo = getStatusInfo(applicant.status);

  return (
    <div className='space-y-6'>
      <Card>
        <CardHeader>
          <CardTitle>Application Status</CardTitle>
          <CardDescription>
            Track the progress of your application to Uptick Talent
          </CardDescription>
        </CardHeader>
        <CardContent className='space-y-6'>
          <div className='bg-white border rounded-lg p-6'>
            <div className='flex items-center justify-between mb-4'>
              <div>
                <h3 className='text-lg font-medium text-gray-900'>
                  {typeof applicant.applicant === 'object'
                    ? `${applicant.applicant.firstName} ${applicant.applicant.lastName}`
                    : 'Applicant'}
                </h3>
                <p className='text-gray-600'>
                  {typeof applicant.applicant === 'object'
                    ? applicant.applicant.email
                    : ''}
                </p>
              </div>
              <div
                className={`px-3 py-1 rounded-full text-sm font-medium ${statusInfo.color}`}
              >
                {statusInfo.label}
              </div>
            </div>

            <div className='space-y-3'>
              <div>
                <span className='text-sm font-medium text-gray-700'>
                  Preferred Track:
                </span>
                <span className='ml-2 text-sm text-gray-900 capitalize'>
                  {typeof applicant.track === 'object'
                    ? applicant.track.name
                    : 'Not specified'}
                </span>
              </div>
              <div>
                <span className='text-sm font-medium text-gray-700'>
                  Application Date:
                </span>
                <span className='ml-2 text-sm text-gray-900'>
                  {formatDate(applicant.createdAt, 'long')}
                </span>
              </div>
              <div>
                <span className='text-sm font-medium text-gray-700'>
                  Last Updated:
                </span>
                <span className='ml-2 text-sm text-gray-900'>
                  {formatDate(applicant.updatedAt, 'long')}
                </span>
              </div>
            </div>
          </div>

          <div className='bg-blue-50 border border-blue-200 rounded-lg p-4'>
            <p className='text-blue-800'>{statusInfo.description}</p>
          </div>

          {applicant.status === 'shortlisted' && (
            <div className='text-center'>
              <Link href='/apply/assessment'>
                <Button>Take Assessment</Button>
              </Link>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
