'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';

export default function Home() {
  const { isAuthenticated, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && isAuthenticated) {
      router.push('/lms/dashboard');
    }
  }, [isAuthenticated, loading, router]);

  if (loading) {
    return (
      <div className='min-h-screen flex items-center justify-center bg-gray-50'>
        <div className='text-gray-600'>Loading...</div>
      </div>
    );
  }

  if (isAuthenticated) {
    return null; // Will redirect in useEffect
  }

  return (
    <div className='min-h-screen bg-linear-to-br from-blue-50 to-indigo-100'>
      <div className='container mx-auto px-4 py-16'>
        {/* Header */}
        <div className='text-center mb-16'>
          <h1 className='text-5xl font-bold text-gray-900 mb-6'>
            Welcome to <span className='text-blue-600'>Uptick Talent</span>
          </h1>
          <p className='text-xl text-gray-600 max-w-3xl mx-auto'>
            Transform your career with our comprehensive learning management
            system. Join thousands of students who are building their future in
            tech.
          </p>
        </div>

        {/* Main Actions */}
        <div className='grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto mb-16'>
          <Card className='hover:shadow-lg transition-shadow'>
            <CardHeader className='text-center'>
              <div className='text-4xl mb-4'>🎓</div>
              <CardTitle className='text-2xl'>Start Your Journey</CardTitle>
              <CardDescription className='text-lg'>
                Apply to join our next cohort and begin your transformation
              </CardDescription>
            </CardHeader>
            <CardContent className='text-center'>
              <Link href='/apply'>
                <Button size='lg' className='w-full'>
                  Apply Now
                </Button>
              </Link>
            </CardContent>
          </Card>

          <Card className='hover:shadow-lg transition-shadow'>
            <CardHeader className='text-center'>
              <div className='text-4xl mb-4'>🔐</div>
              <CardTitle className='text-2xl'>Student Portal</CardTitle>
              <CardDescription className='text-lg'>
                Access your learning dashboard and track your progress
              </CardDescription>
            </CardHeader>
            <CardContent className='text-center'>
              <Link href='/auth/login'>
                <Button size='lg' variant='outline' className='w-full'>
                  Sign In
                </Button>
              </Link>
            </CardContent>
          </Card>
        </div>

        {/* Features */}
        <div className='max-w-6xl mx-auto'>
          <h2 className='text-3xl font-bold text-center text-gray-900 mb-12'>
            Why Choose Uptick Talent?
          </h2>

          <div className='grid grid-cols-1 md:grid-cols-3 gap-8'>
            <div className='text-center'>
              <div className='text-3xl mb-4'>💼</div>
              <h3 className='text-xl font-semibold text-gray-900 mb-3'>
                Industry-Ready Skills
              </h3>
              <p className='text-gray-600'>
                Learn cutting-edge technologies and frameworks used by top tech
                companies worldwide.
              </p>
            </div>

            <div className='text-center'>
              <div className='text-3xl mb-4'>👥</div>
              <h3 className='text-xl font-semibold text-gray-900 mb-3'>
                Expert Mentorship
              </h3>
              <p className='text-gray-600'>
                Get guidance from experienced professionals who are passionate
                about your success.
              </p>
            </div>

            <div className='text-center'>
              <div className='text-3xl mb-4'>🚀</div>
              <h3 className='text-xl font-semibold text-gray-900 mb-3'>
                Career Support
              </h3>
              <p className='text-gray-600'>
                Receive job placement assistance and career coaching to land
                your dream role.
              </p>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className='text-center mt-16 pt-8 border-t border-gray-200'>
          <p className='text-gray-500'>
            © 2024 Uptick Talent. All rights reserved.
          </p>
        </div>
      </div>
    </div>
  );
}
