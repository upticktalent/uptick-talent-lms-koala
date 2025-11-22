/* eslint-disable @typescript-eslint/no-explicit-any */
'use client';

import Link from 'next/link';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useState, useEffect } from 'react';
import { cohortService } from '@/services/cohortService';
import { trackService } from '@/services/trackService';
import { userService } from '@/services/userService';
import { toast } from 'sonner';
import {
  Users,
  BookOpen,
  GraduationCap,
  ClipboardList,
  Clock,
  Sparkles,
  LayoutDashboard,
  Layers,
  Target,
  Database,
  Mail,
  HardDrive,
  Activity,
  ArrowRight,
} from 'lucide-react';

export default function AdminDashboard() {
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalStudents: 0,
    totalMentors: 0,
    totalTracks: 0,
    totalCohorts: 0,
    activeCohorts: 0,
    completedCohorts: 0,
  });

  const fetchAdminStats = async () => {
    try {
      setLoading(true);

      // Fetch tracks (getTracks returns paginated data with tracks array)
      const tracksResponse: any = await trackService.getTracks();
      console.log('Tracks Response:', tracksResponse);
      const tracks =
        tracksResponse.success && tracksResponse.data?.tracks
          ? tracksResponse.data.tracks
          : [];

      // Fetch cohorts (getCohorts returns paginated data with cohorts array)
      const cohortsResponse: any = await cohortService.getCohorts();
      console.log('Cohorts Response:', cohortsResponse);
      const cohorts =
        cohortsResponse.success && cohortsResponse.data?.cohorts
          ? cohortsResponse.data.cohorts
          : [];

      // Fetch all users (no pagination for stats)
      const usersResponse: any = await userService.getAllUsers();
      console.log('Users Response:', usersResponse);
      const users = usersResponse.success
        ? usersResponse.data?.users || []
        : [];

      const students = users.filter((user: any) => user.role === 'student');
      const mentors = users.filter((user: any) => user.role === 'mentor');
      const activeCohorts = cohorts.filter(
        (cohort: any) => cohort.isAcceptingApplications
      );
      const completedCohorts = cohorts.filter(
        (cohort: any) =>
          new Date(cohort.endDate) < new Date() &&
          !cohort.isAcceptingApplications
      );

      // Debug logging
      console.log('Final processed data:', {
        students: students.length,
        mentors: mentors.length,
        tracks: tracks.length,
        cohorts: cohorts.length,
        activeCohorts: activeCohorts.length,
        completedCohorts: completedCohorts.length,
      });

      setStats({
        totalStudents: students.length,
        totalMentors: mentors.length,
        totalTracks: tracks.length,
        totalCohorts: cohorts.length,
        activeCohorts: activeCohorts.length,
        completedCohorts: completedCohorts.length,
      });
    } catch (error) {
      console.error('Error fetching admin stats:', error);
      toast.error('Failed to load dashboard statistics');
      // Set some default values to show the UI structure
      setStats({
        totalStudents: 0,
        totalMentors: 0,
        totalTracks: 0,
        totalCohorts: 0,
        activeCohorts: 0,
        completedCohorts: 0,
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAdminStats();
  }, []);

  const statCards = [
    {
      label: 'Total Students',
      value: loading ? '...' : stats.totalStudents,
      icon: Users,
      description: 'Enrolled students',
      color: 'text-blue-600',
      bgColor: 'bg-blue-50',
    },
    {
      label: 'Total Mentors',
      value: loading ? '...' : stats.totalMentors,
      icon: GraduationCap,
      description: 'System mentors',
      color: 'text-purple-600',
      bgColor: 'bg-purple-50',
    },
    {
      label: 'Learning Tracks',
      value: loading ? '...' : stats.totalTracks,
      icon: BookOpen,
      description: 'Available tracks',
      color: 'text-green-600',
      bgColor: 'bg-green-50',
    },
    {
      label: 'Total Cohorts',
      value: loading ? '...' : stats.totalCohorts,
      icon: Database,
      description: 'All cohorts',
      color: 'text-indigo-600',
      bgColor: 'bg-indigo-50',
    },
    {
      label: 'Active Cohorts',
      value: loading ? '...' : stats.activeCohorts,
      icon: Activity,
      description: 'Currently accepting applications',
      color: 'text-yellow-600',
      bgColor: 'bg-yellow-50',
    },
    {
      label: 'Completed Cohorts',
      value: loading ? '...' : stats.completedCohorts,
      icon: Target,
      description: 'Finished cohorts',
      color: 'text-pink-600',
      bgColor: 'bg-pink-50',
    },
  ];

  const quickActions = [
    {
      title: 'Manage Students',
      description: 'View and manage all students in the system',
      href: '/admin/students',
      icon: Users,
      color: 'text-blue-600',
      bgColor: 'bg-blue-50',
    },
    {
      title: 'Manage Mentors',
      description: 'View and manage mentors',
      href: '/admin/mentors',
      icon: GraduationCap,
      color: 'text-purple-600',
      bgColor: 'bg-purple-50',
    },
    {
      title: 'Manage Tracks',
      description: 'Create and configure learning tracks',
      href: '/admin/tracks',
      icon: BookOpen,
      color: 'text-green-600',
      bgColor: 'bg-green-50',
    },
    {
      title: 'Manage Cohorts',
      description: 'Create and manage cohort cycles',
      href: '/admin/cohorts',
      icon: Layers,
      color: 'text-indigo-600',
      bgColor: 'bg-indigo-50',
    },
    {
      title: 'Review Applications',
      description: 'Go to LMS for applications management',
      href: '/lms/recruitment/applications',
      icon: ClipboardList,
      color: 'text-red-600',
      bgColor: 'bg-red-50',
    },
    {
      title: 'LMS Dashboard',
      description: 'Switch to LMS management view',
      href: '/lms/dashboard',
      icon: Target,
      color: 'text-indigo-600',
      bgColor: 'bg-indigo-50',
    },
  ];

  return (
    <div className='space-y-8'>
      {/* Welcome Section */}
      <div>
        <h1 className='text-3xl font-bold text-gray-900'>Admin Dashboard</h1>
        <p className='text-gray-600 mt-2'>
          Welcome to the system administration panel. Manage all aspects of
          Uptick Talent LMS.
        </p>
      </div>

      {/* Key Metrics */}
      <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6'>
        {statCards.map((stat, index) => {
          const Icon = stat.icon;
          return (
            <div
              key={index}
              className='bg-white p-6 rounded-xl border border-slate-200 shadow-sm flex items-center justify-between hover:shadow-md transition-shadow'
            >
              <div>
                <p className='text-sm font-medium text-slate-500 mb-1'>
                  {stat.label}
                </p>
                <h3 className='text-3xl font-bold text-slate-900'>
                  {stat.value}
                </h3>
              </div>
              <div className={`p-3 rounded-full ${stat.bgColor}`}>
                <Icon className={`w-6 h-6 ${stat.color}`} />
              </div>
            </div>
          );
        })}
      </div>

      {/* System Overview */}

      {/* Admin Quick Actions */}
      <div className='grid grid-cols-1 lg:grid-cols-2 gap-6'>
        <div className='bg-white rounded-xl border border-slate-200 overflow-hidden'>
          <div className='p-6 border-b border-slate-100'>
            <h3 className='font-semibold text-gray-900'>System Management</h3>
            <p className='text-sm text-gray-500'>
              Key administrative functions
            </p>
          </div>
          <div className='p-6'>
            <div className='space-y-4'>
              <div className='flex items-center justify-between p-3 bg-blue-50 rounded-lg'>
                <div className='flex items-center gap-3'>
                  <Users className='w-5 h-5 text-blue-600' />
                  <span className='font-medium text-gray-900'>
                    User Management
                  </span>
                </div>
                <Link href='/admin/users'>
                  <Button size='sm' variant='outline'>
                    Manage
                  </Button>
                </Link>
              </div>

              <div className='flex items-center justify-between p-3 bg-green-50 rounded-lg'>
                <div className='flex items-center gap-3'>
                  <BookOpen className='w-5 h-5 text-green-600' />
                  <span className='font-medium text-gray-900'>
                    Track Configuration
                  </span>
                </div>
                <Link href='/admin/tracks'>
                  <Button size='sm' variant='outline'>
                    Configure
                  </Button>
                </Link>
              </div>

              <div className='flex items-center justify-between p-3 bg-purple-50 rounded-lg'>
                <div className='flex items-center gap-3'>
                  <Layers className='w-5 h-5 text-purple-600' />
                  <span className='font-medium text-gray-900'>
                    Cohort Management
                  </span>
                </div>
                <Link href='/admin/cohorts'>
                  <Button size='sm' variant='outline'>
                    Manage
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </div>

        <div className='bg-white rounded-xl border border-slate-200 overflow-hidden'>
          <div className='p-6 border-b border-slate-100'>
            <h3 className='font-semibold text-gray-900'>System Status</h3>
            <p className='text-sm text-gray-500'>
              Current system health and status
            </p>
          </div>
          <div className='p-6'>
            <div className='space-y-4'>
              <div className='flex items-center justify-between p-3 bg-gray-50/50 rounded-lg'>
                <div className='flex items-center gap-3'>
                  <div className='p-2 bg-green-100 rounded-full text-green-600'>
                    <Database className='w-4 h-4' />
                  </div>
                  <span className='text-sm font-medium text-gray-700'>
                    Database
                  </span>
                </div>
                <div className='flex items-center gap-2'>
                  <div className='w-2 h-2 bg-green-500 rounded-full animate-pulse'></div>
                  <span className='text-sm text-green-600 font-medium'>
                    Healthy
                  </span>
                </div>
              </div>

              <div className='flex items-center justify-between p-3 bg-gray-50/50 rounded-lg'>
                <div className='flex items-center gap-3'>
                  <div className='p-2 bg-green-100 rounded-full text-green-600'>
                    <Mail className='w-4 h-4' />
                  </div>
                  <span className='text-sm font-medium text-gray-700'>
                    Email Service
                  </span>
                </div>
                <div className='flex items-center gap-2'>
                  <div className='w-2 h-2 bg-green-500 rounded-full animate-pulse'></div>
                  <span className='text-sm text-green-600 font-medium'>
                    Operational
                  </span>
                </div>
              </div>

              <div className='flex items-center justify-between p-3 bg-gray-50/50 rounded-lg'>
                <div className='flex items-center gap-3'>
                  <div className='p-2 bg-green-100 rounded-full text-green-600'>
                    <HardDrive className='w-4 h-4' />
                  </div>
                  <span className='text-sm font-medium text-gray-700'>
                    File Storage
                  </span>
                </div>
                <div className='flex items-center gap-2'>
                  <div className='w-2 h-2 bg-green-500 rounded-full animate-pulse'></div>
                  <span className='text-sm text-green-600 font-medium'>
                    Available
                  </span>
                </div>
              </div>

              <div className='flex items-center justify-between p-3 bg-gray-50/50 rounded-lg'>
                <div className='flex items-center gap-3'>
                  <div className='p-2 bg-yellow-100 rounded-full text-yellow-600'>
                    <Activity className='w-4 h-4' />
                  </div>
                  <span className='text-sm font-medium text-gray-700'>
                    API Performance
                  </span>
                </div>
                <div className='flex items-center gap-2'>
                  <div className='w-2 h-2 bg-yellow-500 rounded-full'></div>
                  <span className='text-sm text-yellow-600 font-medium'>
                    Moderate
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
