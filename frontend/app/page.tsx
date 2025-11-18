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
import { ThemeToggle } from '@/components/theme-toggle';

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
      <div className='min-h-screen flex items-center justify-center bg-[#070C19]'>
        <div className='flex items-center space-x-3'>
          <div className='animate-spin rounded-full h-8 w-8 border-b-2 border-[#477BFF]'></div>
          <div className='text-[#A7B0BE] text-lg'>Loading Uptick Talent...</div>
        </div>
      </div>
    );
  }

  if (isAuthenticated) {
    return null; // Will redirect in useEffect
  }

  return (
    <div className='min-h-screen bg-background'>
      {/* Navigation */}
      <nav className='border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60'>
        <div className='max-w-6xl mx-auto px-4 sm:px-6 lg:px-8'>
          <div className='flex justify-between items-center h-16'>
            <div className='flex items-center space-x-3'>
              <div className='text-2xl font-bold text-foreground'>
                Uptick Talent
              </div>
              <div className='text-sm text-muted-foreground'>LMS</div>
            </div>
            <div className='flex items-center space-x-4'>
              <ThemeToggle />
              <Link href='/auth/login'>
                <Button variant='secondary' size='sm'>
                  Sign In
                </Button>
              </Link>
              <Link href='/apply'>
                <Button variant='primary' size='sm'>
                  Apply Now
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </nav>

      <div className='max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-16'>
        {/* Hero Section */}
        <div className='text-center mb-20'>
          <h1 className='text-6xl font-bold text-foreground mb-8 leading-tight'>
            Transform Your <br />
            <span className='text-primary'>Tech Career</span>
          </h1>
          <p className='text-xl text-muted-foreground max-w-3xl mx-auto leading-relaxed'>
            Join Africa's premier tech talent development program. Master
            in-demand skills, work on real projects, and land your dream job
            with our comprehensive learning management system.
          </p>
        </div>

        {/* Main Actions */}
        <div className='grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto mb-20'>
          <Card className='hover:shadow-2xl transition-all duration-300 hover:border-[#477BFF]/50'>
            <CardHeader className='text-center'>
              <div className='text-5xl mb-6'>🎓</div>
              <CardTitle className='text-2xl mb-3'>
                Start Your Journey
              </CardTitle>
              <CardDescription className='text-lg'>
                Apply to join our next cohort and begin your transformation into
                a skilled tech professional
              </CardDescription>
            </CardHeader>
            <CardContent className='text-center'>
              <Link href='/apply'>
                <Button size='lg' className='w-full' variant='primary'>
                  Apply for Next Cohort
                </Button>
              </Link>
            </CardContent>
          </Card>

          <Card className='hover:shadow-2xl transition-all duration-300 hover:border-[#477BFF]/50'>
            <CardHeader className='text-center'>
              <div className='text-5xl mb-6'>�</div>
              <CardTitle className='text-2xl mb-3'>Student Portal</CardTitle>
              <CardDescription className='text-lg'>
                Access your personalized learning dashboard, track progress, and
                connect with peers
              </CardDescription>
            </CardHeader>
            <CardContent className='text-center'>
              <Link href='/auth/login'>
                <Button size='lg' variant='secondary' className='w-full'>
                  Access Portal
                </Button>
              </Link>
            </CardContent>
          </Card>
        </div>

        {/* Features */}
        <div className='max-w-6xl mx-auto'>
          <h2 className='text-4xl font-bold text-center text-white mb-16'>
            Why Choose Uptick Talent?
          </h2>

          <div className='grid grid-cols-1 md:grid-cols-3 gap-8'>
            <div className='text-center group'>
              <div className='text-4xl mb-6 group-hover:scale-110 transition-transform duration-200'>
                💼
              </div>
              <h3 className='text-xl font-semibold text-white mb-4'>
                Industry-Ready Skills
              </h3>
              <p className='text-[#A7B0BE] leading-relaxed'>
                Master cutting-edge technologies and frameworks used by Fortune
                500 companies. From React to Cloud Computing.
              </p>
            </div>

            <div className='text-center group'>
              <div className='text-4xl mb-6 group-hover:scale-110 transition-transform duration-200'>
                👥
              </div>
              <h3 className='text-xl font-semibold text-white mb-4'>
                Expert Mentorship
              </h3>
              <p className='text-[#A7B0BE] leading-relaxed'>
                Learn from senior engineers and industry veterans who are
                passionate about nurturing the next generation of tech talent.
              </p>
            </div>

            <div className='text-center group'>
              <div className='text-4xl mb-6 group-hover:scale-110 transition-transform duration-200'>
                🚀
              </div>
              <h3 className='text-xl font-semibold text-white mb-4'>
                Career Acceleration
              </h3>
              <p className='text-[#A7B0BE] leading-relaxed'>
                Get job placement assistance, interview coaching, and networking
                opportunities to fast-track your tech career.
              </p>
            </div>
          </div>
        </div>

        {/* CTA Section */}
        <div className='text-center mt-20 p-8 rounded-2xl bg-gradient-to-r from-[#477BFF]/10 to-[#477BFF]/5 border border-[#477BFF]/20'>
          <h2 className='text-3xl font-bold text-white mb-4'>
            Ready to Transform Your Future?
          </h2>
          <p className='text-[#A7B0BE] mb-8 text-lg'>
            Join hundreds of successful graduates who landed their dream jobs
          </p>
          <div className='flex flex-col sm:flex-row gap-4 justify-center max-w-md mx-auto'>
            <Link href='/apply'>
              <Button size='lg' variant='primary' className='w-full sm:w-auto'>
                Apply Today
              </Button>
            </Link>
            <Link href='/auth/login'>
              <Button
                size='lg'
                variant='secondary'
                className='w-full sm:w-auto'
              >
                Student Login
              </Button>
            </Link>
          </div>
        </div>

        {/* Footer */}
        <div className='text-center mt-16 pt-8 border-t border-[#2F343C]'>
          <p className='text-[#7B8494]'>
            © 2024 Uptick Talent. Empowering Africa's tech future.
          </p>
        </div>
      </div>
    </div>
  );
}
