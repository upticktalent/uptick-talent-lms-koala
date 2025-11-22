'use client';

import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { Suspense } from 'react';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { CheckCircle, Mail, Clock } from 'lucide-react';

function ApplicationSuccessContent() {
  const searchParams = useSearchParams();
  const applicationId = searchParams.get('id');

  return (
    <div className='min-h-screen bg-gray-50 flex items-center justify-center p-4'>
      <Card className='w-full max-w-2xl text-center'>
        <CardHeader>
          <div className='mx-auto mb-4'>
            <CheckCircle className='h-20 w-20 text-green-500' />
          </div>
          <CardTitle className='text-3xl text-green-600'>
            Application Submitted Successfully!
          </CardTitle>
          <CardDescription className='text-lg'>
            Thank you for applying to Uptick Talent LMS. Your application has
            been received and is being processed.
          </CardDescription>
        </CardHeader>
        <CardContent className='space-y-6'>
          {applicationId && (
            <div className='bg-gray-50 p-4 rounded-lg'>
              <p className='text-sm text-gray-600 mb-1'>Application ID:</p>
              <p className='font-mono text-lg font-bold text-gray-900'>
                {applicationId}
              </p>
              <p className='text-xs text-gray-500 mt-1'>
                Please save this ID for your records
              </p>
            </div>
          )}

          <div className='grid grid-cols-1 md:grid-cols-2 gap-6 text-left'>
            <div className='bg-blue-50 p-4 rounded-lg'>
              <div className='flex items-center mb-2'>
                <Mail className='h-5 w-5 text-blue-600 mr-2' />
                <h3 className='font-semibold text-blue-900'>
                  Email Confirmation
                </h3>
              </div>
              <p className='text-sm text-blue-800'>
                You'll receive a confirmation email shortly with your
                application details.
              </p>
            </div>

            <div className='bg-yellow-50 p-4 rounded-lg'>
              <div className='flex items-center mb-2'>
                <Clock className='h-5 w-5 text-yellow-600 mr-2' />
                <h3 className='font-semibold text-yellow-900'>
                  Review Process
                </h3>
              </div>
              <p className='text-sm text-yellow-800'>
                Our team will review your application within 5-7 business days.
              </p>
            </div>
          </div>

          <div className='bg-gray-100 p-6 rounded-lg text-left'>
            <h3 className='font-semibold text-gray-900 mb-3'>
              What happens next?
            </h3>
            <div className='space-y-2 text-sm text-gray-700'>
              <div className='flex items-start'>
                <span className='inline-block w-6 h-6 bg-blue-600 text-white rounded-full text-xs text-center leading-6 mr-3 mt-0.5'>
                  1
                </span>
                <p>
                  <strong>Application Review:</strong> Our admissions team will
                  carefully review your application and CV.
                </p>
              </div>
              <div className='flex items-start'>
                <span className='inline-block w-6 h-6 bg-blue-600 text-white rounded-full text-xs text-center leading-6 mr-3 mt-0.5'>
                  2
                </span>
                <p>
                  <strong>Shortlisting:</strong> If shortlisted, you'll receive
                  an email with assessment instructions.
                </p>
              </div>
              <div className='flex items-start'>
                <span className='inline-block w-6 h-6 bg-blue-600 text-white rounded-full text-xs text-center leading-6 mr-3 mt-0.5'>
                  3
                </span>
                <p>
                  <strong>Assessment:</strong> Complete the technical assessment
                  to demonstrate your skills.
                </p>
              </div>
              <div className='flex items-start'>
                <span className='inline-block w-6 h-6 bg-blue-600 text-white rounded-full text-xs text-center leading-6 mr-3 mt-0.5'>
                  4
                </span>
                <p>
                  <strong>Interview:</strong> Successful candidates will be
                  invited for a final interview.
                </p>
              </div>
              <div className='flex items-start'>
                <span className='inline-block w-6 h-6 bg-green-600 text-white rounded-full text-xs text-center leading-6 mr-3 mt-0.5'>
                  5
                </span>
                <p>
                  <strong>Acceptance:</strong> Final candidates will receive
                  acceptance letters and course details.
                </p>
              </div>
            </div>
          </div>

          <div className='pt-4 space-y-3'>
            <Link href='/' className='block'>
              <Button className='w-full' size='lg'>
                Return to Home
              </Button>
            </Link>
            <p className='text-xs text-gray-500'>
              Questions? Contact us at{' '}
              <a
                href='mailto:admissions@upticktalent.com'
                className='text-blue-600 hover:underline'
              >
                admissions@upticktalent.com
              </a>
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

export default function ApplicationSuccessPage() {
  return (
    <Suspense
      fallback={
        <div className='min-h-screen bg-gray-50 flex items-center justify-center p-4'>
          <Card className='w-full max-w-2xl text-center'>
            <CardContent className='p-8'>
              <div className='animate-spin rounded-full h-8 w-8 border-b-2 border-green-500 mx-auto'></div>
              <p className='mt-4 text-gray-600'>Loading...</p>
            </CardContent>
          </Card>
        </div>
      }
    >
      <ApplicationSuccessContent />
    </Suspense>
  );
}
