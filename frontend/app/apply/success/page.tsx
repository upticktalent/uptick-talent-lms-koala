'use client';

import { Suspense } from 'react';
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
import { CheckCircle, Mail, Clock } from 'lucide-react';
import Loader from '@/components/Loader';

function ApplicationSuccessContent() {
  const searchParams = useSearchParams();
  const applicationId = searchParams.get('id');

  return (
    <div className='min-h-screen bg-gray-50 flex items-center justify-center p-4'>
      <Card className='w-full max-w-2xl border-t-4 border-t-primary shadow-lg bg-white'>
        <CardHeader className="text-center pb-2">
          <CardTitle className='text-3xl font-bold text-gray-900'>
            Application Received
          </CardTitle>
          <CardDescription className='text-lg text-gray-600 mt-2'>
            Thank you for applying to Uptick Talent. We have received your application.
          </CardDescription>
        </CardHeader>
        <CardContent className='space-y-8 pt-6'>
          {applicationId && (
            <div className='bg-gray-50 p-6 rounded-lg border border-gray-100 text-center'>
              <p className='text-xs text-gray-500 uppercase tracking-wider font-semibold'>
                Application Reference
              </p>
              <p className='text-3xl font-mono font-bold text-primary mt-2'>
                {applicationId}
              </p>
              <p className='text-sm text-gray-400 mt-2'>
                Please keep this ID for your records
              </p>
            </div>
          )}

          <div className='grid md:grid-cols-2 gap-8'>
            <div className='space-y-2'>
              <h3 className='font-semibold text-gray-900'>Confirmation Email</h3>
              <p className='text-sm text-gray-600 leading-relaxed'>
                You will receive an email shortly confirming the details of your
                application.
              </p>
            </div>
            <div className='space-y-2'>
              <h3 className='font-semibold text-gray-900'>Review Timeline</h3>
              <p className='text-sm text-gray-600 leading-relaxed'>
                Our team typically reviews applications within 5-7 business days.
              </p>
            </div>
          </div>

          <div className='space-y-4'>
            <h3 className='font-semibold text-gray-900 border-b pb-2'>
              Next Steps
            </h3>
            <div className='space-y-4'>
              <div className='flex gap-4'>
                <span className='flex-shrink-0 w-6 h-6 rounded-full bg-primary/10 text-primary flex items-center justify-center text-sm font-medium'>
                  1
                </span>
                <p className='text-sm text-gray-600'>
                  <span className='font-medium text-gray-900'>Review:</span> We
                  review your application and CV.
                </p>
              </div>
              <div className='flex gap-4'>
                <span className='flex-shrink-0 w-6 h-6 rounded-full bg-primary/10 text-primary flex items-center justify-center text-sm font-medium'>
                  2
                </span>
                <p className='text-sm text-gray-600'>
                  <span className='font-medium text-gray-900'>Shortlisting:</span>{' '}
                  If shortlisted, you'll receive an email with assessment
                  instructions.
                </p>
              </div>
              <div className='flex gap-4'>
                <span className='flex-shrink-0 w-6 h-6 rounded-full bg-primary/10 text-primary flex items-center justify-center text-sm font-medium'>
                  3
                </span>
                <p className='text-sm text-gray-600'>
                  <span className='font-medium text-gray-900'>Assessment:</span>{' '}
                  Complete the technical assessment to demonstrate your skills.
                </p>
              </div>
              <div className='flex gap-4'>
                <span className='flex-shrink-0 w-6 h-6 rounded-full bg-primary/10 text-primary flex items-center justify-center text-sm font-medium'>
                  4
                </span>
                <p className='text-sm text-gray-600'>
                  <span className='font-medium text-gray-900'>Interview:</span>{' '}
                  Successful candidates will be invited for a final interview.
                </p>
              </div>
              <div className='flex gap-4'>
                <span className='flex-shrink-0 w-6 h-6 rounded-full bg-primary/10 text-primary flex items-center justify-center text-sm font-medium'>
                  5
                </span>
                <p className='text-sm text-gray-600'>
                  <span className='font-medium text-gray-900'>Acceptance:</span>{' '}
                  Final candidates will receive acceptance letters.
                </p>
              </div>
            </div>
          </div>

          <div className='pt-6 space-y-4'>
            <Link href='/' className='block'>
              <Button className='w-full' size='lg'>
                Return to Home
              </Button>
            </Link>
            <p className='text-xs text-center text-gray-500'>
              Questions? Contact us at{' '}
              <a
                href='mailto:admissions@upticktalent.com'
                className='text-primary hover:underline'
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
    <Suspense fallback={<Loader />}>
      <ApplicationSuccessContent />
    </Suspense>
  );
}
