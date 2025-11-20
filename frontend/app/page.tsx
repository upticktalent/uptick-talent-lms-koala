'use client';

import { LoaderCircle } from 'lucide-react';
import { useUser } from '@/hooks/useUser';
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';

import { ThemeToggle } from '@/components/theme-toggle';
import Loader from '@/components/Loader';

export default function Home() {
  const { isAuthenticated, loading } = useAuth();
  const { isAdmin } = useUser();
  const router = useRouter();

  useEffect(() => {
    if (!loading) {
      if (isAuthenticated) {
        if (isAdmin) {
          router.replace('/admin/dashboard');
        } else {
          router.replace('/lms/dashboard');
        }
      } else {
        router.replace('/auth/login');
      }
    }
  }, [isAuthenticated, loading, router]);

  if (loading) {
    return <Loader />;
  }

  if (isAuthenticated) {
    return null; // Will redirect in useEffect
  }

  return <Loader />;
}
