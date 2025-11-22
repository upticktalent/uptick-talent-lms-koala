'use client';

import React, { useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import { cn } from '@/utils/cn';
import { useUser } from '@/hooks/useUser';
import {
  LayoutDashboard,
  Users,
  Settings,
  ChevronRight,
  X,
  BookOpen,
  Layers,
  UserCheck,
  GraduationCap,
  MonitorPlay,
  BookOpenCheck,
} from 'lucide-react';

interface AdminSidebarProps {
  className?: string;
  open?: boolean;
  onClose?: () => void;
}

export function AdminSidebar({
  className,
  open = false,
  onClose,
}: AdminSidebarProps) {
  const pathname = usePathname();
  const { user } = useUser();

  const navigation = [
    {
      name: 'Dashboard',
      href: '/admin/dashboard',
      icon: LayoutDashboard,
      show: true,
    },
    {
      name: 'LMS',
      href: '/lms/dashboard',
      icon: MonitorPlay,
      show: true,
    },
    {
      name: 'Cohorts',
      href: '/admin/cohorts',
      icon: Layers,
      show: true,
      children: [
        { name: 'All Cohorts', href: '/admin/cohorts' },
        { name: 'Create Cohort', href: '/admin/cohorts/create' },
        { name: 'Cohort Settings', href: '/admin/cohorts/settings' },
      ],
    },
    {
      name: 'Applications',
      href: '/admin/applications',
      icon: BookOpen,
      show: true,
      children: [
        { name: 'All Applications', href: '/admin/applications' },
        { name: 'By Status', href: '/admin/applications/status' },
        { name: 'Interview Slots', href: '/admin/applications/interviews' },
      ],
    },
    {
      name: 'Users',
      href: '/admin/users',
      icon: Users,
      show: true,
      children: [
        { name: 'All Users', href: '/admin/users' },
        { name: 'Mentors', href: '/admin/users/mentors' },
        { name: 'Students', href: '/admin/users/students' },
        { name: 'Create User', href: '/admin/users/create' },
      ],
    },
    {
      name: 'Tracks',
      href: '/admin/tracks',
      icon: BookOpenCheck,
      show: true,
      children: [
        { name: 'All Tracks', href: '/admin/tracks' },
        { name: 'Create Track', href: '/admin/tracks/create' },
        { name: 'Track Analytics', href: '/admin/tracks/analytics' },
      ],
    },
  ];

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose?.();
      }
    };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [open, onClose]);

  const isActivePath = (href: string) => {
    if (href === '/admin/dashboard') {
      return pathname === href;
    }
    return pathname.startsWith(href);
  };

  return (
    <>
      {/* Desktop sidebar */}
      <aside
        className={cn(
          'h-full w-64 flex-col hidden lg:flex bg-[hsl(var(--card))] border-r border-[hsl(var(--border))]',
          className
        )}
      >
        <div className='flex flex-col flex-1 min-h-0'>
          {/* Header */}
          <div className='flex items-center h-16 mt-2'>
            <div className='flex items-start'>
              <div className='relative'>
                <Image
                  src='/uptick-logo.png'
                  alt='Uptick Talent'
                  width={100}
                  height={100}
                  className='object-contain'
                />
              </div>
            </div>
          </div>

          {/* Navigation */}
          <nav className='flex-1 px-3 py-6 space-y-1'>
            {navigation.map((item) => {
              if (!item.show) return null;

              const Icon = item.icon;
              const isActive = isActivePath(item.href);

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    'group flex items-center px-3 py-2.5 text-sm font-medium rounded-lg transition-all duration-200',
                    isActive
                      ? 'bg-blue-50 text-blue-700 border border-blue-200 shadow-sm'
                      : 'text-[hsl(var(--muted-foreground))] hover:bg-[hsl(var(--muted))] hover:text-[hsl(var(--foreground))]'
                  )}
                >
                  <Icon
                    className={cn(
                      'h-4 w-4 mr-3 transition-colors',
                      isActive
                        ? 'text-blue-600'
                        : 'text-gray-400 group-hover:text-gray-600'
                    )}
                  />
                  {item.name}
                  {isActive && (
                    <ChevronRight className='h-3 w-3 ml-auto text-blue-600' />
                  )}
                </Link>
              );
            })}
          </nav>

          {/* User info */}
          <div className='p-4 border-t border-[hsl(var(--border))]'>
            <div className='flex items-center gap-3'>
              <div className='w-8 h-8 bg-linear-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center'>
                <span className='text-xs font-medium text-white'>
                  {user?.firstName?.[0]}
                  {user?.lastName?.[0]}
                </span>
              </div>
              <div className='flex-1 min-w-0'>
                <p className='text-sm font-medium text-[hsl(var(--foreground))] truncate'>
                  {user?.firstName} {user?.lastName}
                </p>
                <p className='text-xs text-[hsl(var(--muted-foreground))] capitalize'>
                  {user?.role}
                </p>
              </div>
            </div>
          </div>
        </div>
      </aside>

      {/* Mobile drawer */}
      <div
        className={cn(
          'md:hidden fixed inset-0 z-50 flex',
          open ? 'pointer-events-auto' : 'pointer-events-none'
        )}
        aria-hidden={!open}
      >
        {/* Backdrop */}
        <div
          className={cn(
            'fixed inset-0 bg-black/40 transition-opacity duration-200',
            open ? 'opacity-100' : 'opacity-0'
          )}
          onClick={() => onClose && onClose()}
        />

        <div
          className={cn(
            'relative w-80 h-full bg-[hsl(var(--card))] shadow-xl transform transition-transform duration-300 ease-in-out border-r border-[hsl(var(--border))]',
            open ? 'translate-x-0' : '-translate-x-full'
          )}
        >
          {/* Mobile header */}
          <div className='flex items-center justify-between mt-2 h-16 border-b border-[hsl(var(--border))]'>
            <div className='flex items-start'>
              <div className='relative'>
                <Image
                  src='/uptick-logo.png'
                  alt='Uptick Talent'
                  width={100}
                  height={100}
                  className='object-contain'
                />
              </div>
            </div>
            <button
              className='p-2 rounded-md text-[hsl(var(--muted-foreground))] hover:bg-[hsl(var(--muted))] transition-colors cursor-pointer'
              onClick={() => onClose && onClose()}
              aria-label='Close sidebar'
            >
              <X className='h-5 w-5' />
            </button>
          </div>

          {/* Mobile navigation */}
          <nav className='px-3 py-6 space-y-1 overflow-auto h-[calc(100%-64px)]'>
            {navigation.map((item) => {
              if (!item.show) return null;

              const Icon = item.icon;
              const isActive = isActivePath(item.href);

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => onClose && onClose()}
                  className={cn(
                    'group flex items-center px-3 py-2.5 text-sm font-medium rounded-lg transition-all duration-200',
                    isActive
                      ? 'bg-blue-50 text-blue-700 border border-blue-200 shadow-sm'
                      : 'text-[hsl(var(--muted-foreground))] hover:bg-[hsl(var(--muted))] hover:text-[hsl(var(--foreground))]'
                  )}
                >
                  <Icon
                    className={cn(
                      'h-4 w-4 mr-3',
                      isActive ? 'text-blue-600' : 'text-gray-400'
                    )}
                  />
                  {item.name}
                  {isActive && (
                    <ChevronRight className='h-3 w-3 ml-auto text-blue-600' />
                  )}
                </Link>
              );
            })}
          </nav>
        </div>
      </div>
    </>
  );
}
