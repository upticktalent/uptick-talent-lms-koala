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
import { CheckCircle } from 'lucide-react';

function AssessmentSuccessContent() {
  const searchParams = useSearchParams();
  const applicationId = searchParams.get('id');

  return (
    <div className='min-h-screen bg-gray-50 flex items-center justify-center p-4'>
      <Card className='w-full max-w-md text-center'>
        <CardHeader>
          <div className='mx-auto mb-4'>
            <CheckCircle className='h-16 w-16 text-green-500' />
          </div>
          <CardTitle className='text-2xl text-green-600'>
            Assessment Submitted Successfully!
          </CardTitle>
          <CardDescription>
            Your assessment has been received and will be reviewed by our team.
          </CardDescription>
        </CardHeader>
        <CardContent className='space-y-4'>
          {applicationId && (
            <div className='bg-gray-50 p-4 rounded-lg'>
              <p className='text-sm text-gray-600'>Application ID:</p>
              <p className='font-mono text-sm font-medium'>{applicationId}</p>
            </div>
          )}

          <div className='text-sm text-gray-600 space-y-2'>
            <p>
              <strong>What happens next?</strong>
            </p>
            <ul className='text-left space-y-1'>
              <li>• Our team will review your submission</li>
              <li>• You'll receive an email notification with the results</li>
              <li>• This process typically takes 3-5 business days</li>
            </ul>
          </div>

          <div className='pt-4'>
            <Link href='/'>
              <Button className='w-full'>Return to Home</Button>
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

export default function AssessmentSuccessPage() {
  return (
    <Suspense
      fallback={
        <div className='min-h-screen bg-gray-50 flex items-center justify-center p-4'>
          <Card className='w-full max-w-md text-center'>
            <CardContent className='p-8'>
              <div className='animate-spin rounded-full h-8 w-8 border-b-2 border-green-500 mx-auto'></div>
              <p className='mt-4 text-gray-600'>Loading...</p>
            </CardContent>
          </Card>
        </div>
      }
    >
      <AssessmentSuccessContent />
    </Suspense>
  );
}
