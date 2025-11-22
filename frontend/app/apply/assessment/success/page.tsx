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
import { CheckCircle } from 'lucide-react';
import Loader from '@/components/Loader';

function AssessmentSuccessContent() {
  const searchParams = useSearchParams();
  const applicationId = searchParams.get('id');

  return (
    <div className='min-h-screen bg-gray-50 flex items-center justify-center p-4'>
      <Card className='w-full max-w-md border-t-4 border-t-primary shadow-lg bg-white'>
        <CardHeader className="text-center pb-2">
          <CardTitle className='text-2xl font-bold text-gray-900'>
            Assessment Submitted
          </CardTitle>
          <CardDescription className='text-gray-600 mt-2'>
            Your assessment has been received and will be reviewed by our team.
          </CardDescription>
        </CardHeader>
        <CardContent className='space-y-6 pt-6'>
          {applicationId && (
            <div className='bg-gray-50 p-4 rounded-lg border border-gray-100 text-center'>
              <p className='text-xs text-gray-500 uppercase tracking-wider font-semibold'>
                Application Reference
              </p>
              <p className='font-mono text-xl font-bold text-primary mt-1'>
                {applicationId}
              </p>
            </div>
          )}

          <div className='space-y-4'>
            <h3 className='font-semibold text-gray-900 border-b pb-2'>
              Next Steps
            </h3>
            <div className='space-y-3'>
              <div className='flex gap-3'>
                <div className='w-1.5 h-1.5 rounded-full bg-primary mt-2 flex-shrink-0' />
                <p className='text-sm text-gray-600'>
                  Our team will review your submission.
                </p>
              </div>
              <div className='flex gap-3'>
                <div className='w-1.5 h-1.5 rounded-full bg-primary mt-2 flex-shrink-0' />
                <p className='text-sm text-gray-600'>
                  You'll receive an email notification with the results.
                </p>
              </div>
              <div className='flex gap-3'>
                <div className='w-1.5 h-1.5 rounded-full bg-primary mt-2 flex-shrink-0' />
                <p className='text-sm text-gray-600'>
                  This process typically takes 3-5 business days.
                </p>
              </div>
            </div>
          </div>

          <div className='pt-4'>
            <Link href='/'>
              <Button className='w-full' size='lg'>
                Return to Home
              </Button>
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

export default function AssessmentSuccessPage() {
  return (
    <Suspense fallback={<Loader />}>
      <AssessmentSuccessContent />
    </Suspense>
  );
}
