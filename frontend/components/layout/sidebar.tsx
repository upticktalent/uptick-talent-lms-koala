'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/utils/cn';
import { useUser } from '@/hooks/useUser';

interface SidebarProps {
  className?: string;
}

export function Sidebar({ className }: SidebarProps) {
  const pathname = usePathname();
  const { user, isAdmin, isMentor, canManageRecruitment } = useUser();

  const navigation = [
    {
      name: 'Dashboard',
      href: '/lms/dashboard',
      show: true,
    },
    {
      name: 'Recruitment',
      href: '/lms/recruitment',
      show: canManageRecruitment,
      children: [
        { name: 'Applications', href: '/lms/recruitment/applications' },
        { name: 'Assessments', href: '/lms/recruitment/assessments' },
        { name: 'Interviews', href: '/lms/recruitment/interviews' },
      ],
    },
    {
      name: 'Tracks',
      href: '/lms/tracks',
      show: true,
    },
    {
      name: 'Streams',
      href: '/lms/streams',
      show: true,
    },
    {
      name: 'Emails',
      href: '/lms/emails',
      show: canManageRecruitment,
    },
  ];

  return (
    <div className={cn('flex h-full w-64 flex-col bg-gray-50', className)}>
      <div className="flex flex-col flex-1 min-h-0">
        <div className="flex items-center h-16 px-4 bg-white shadow-sm">
          <h1 className="text-lg font-semibold text-gray-900">Uptick Talent</h1>
        </div>
        <nav className="flex-1 px-2 py-4 space-y-1">
          {navigation.map((item) => {
            if (!item.show) return null;

            if (item.children) {
              return (
                <div key={item.name}>
                  <div className="px-3 py-2 text-sm font-medium text-gray-600">
                    {item.name}
                  </div>
                  {item.children.map((child) => (
                    <Link
                      key={child.href}
                      href={child.href}
                      className={cn(
                        'group flex items-center px-3 py-2 text-sm font-medium rounded-md ml-4',
                        pathname === child.href
                          ? 'bg-blue-100 text-blue-700'
                          : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
                      )}
                    >
                      {child.name}
                    </Link>
                  ))}
                </div>
              );
            }

            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  'group flex items-center px-3 py-2 text-sm font-medium rounded-md',
                  pathname === item.href
                    ? 'bg-blue-100 text-blue-700'
                    : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
                )}
              >
                {item.name}
              </Link>
            );
          })}
        </nav>
      </div>
    </div>
  );
}
