// hooks/useNavigation.ts
'use client';

import { useMemo } from 'react';
import {
  LayoutDashboard,
  FileText,
  Users,
  BookOpen,
  MessageSquare,
  NotebookPen,
  CalendarCheck,
  GraduationCap,
  UserRoundPen,
  MessagesSquare,
} from 'lucide-react';

export function useNavigation(cohortName?: string) {
  const navigationItems = useMemo(() => {
    const BASE_NAVIGATION_ITEMS = [
      {
        id: 'dashboard',
        label: 'Dashboard',
        icon: LayoutDashboard,
        href: '/admin',
      },
      {
        id: 'recruitment',
        label: 'Recruitment',
        icon: FileText,
        children: [
          {
            id: 'applications',
            label: 'Applications',
            href: '/admin/applications',
            icon: FileText,
          },
          {
            id: 'assessments',
            label: 'Assessments',
            href: '/admin/assessments',
            icon: NotebookPen,
          },
          { id: 'scheduling', label: 'Scheduling', href: '/admin/scheduling', icon: CalendarCheck },
          {
            id: 'interviews',
            label: 'Interviews',
            href: '/admin/interviews',
            icon: MessagesSquare,
          },
        ],
      },
      {
        id: 'people',
        label: 'People',
        icon: Users,
        children: [
          { id: 'students', label: 'Students', href: '/admin/students', icon: GraduationCap },
          { id: 'mentors', label: 'Mentors', href: '/admin/mentors', icon: UserRoundPen },
        ],
      },
      {
        id: 'resources',
        label: 'Resources',
        icon: BookOpen,
        href: '/admin/resources',
      },
      {
        id: 'messaging',
        label: 'Messaging',
        icon: MessageSquare,
        href: '/admin/messaging',
      },
    ];

    if (!cohortName) return BASE_NAVIGATION_ITEMS;

    return BASE_NAVIGATION_ITEMS.map(item => {
      if (item.children) {
        return {
          ...item,
          children: item.children.map(child => {
            if (
              child.href?.includes('/admin/applications') ||
              child.href?.includes('/admin/assessments') ||
              child.href?.includes('/admin/interviews') ||
              child.href?.includes('/admin/scheduling') ||
              child.href?.includes('/admin/students') ||
              child.href?.includes('/admin/mentors')
            ) {
              return {
                ...child,
                href: child.href.replace(
                  '/admin',
                  `/admin/${cohortName.toLowerCase().replace(' ', '-')}`,
                ),
              };
            }
            return child;
          }),
        };
      }

      return {
        ...item,
        href:
          item.href?.replace('/admin', `/admin/${cohortName.toLowerCase().replace(' ', '-')}`) ??
          item.href,
      };
    });
  }, [cohortName]);

  return navigationItems;
}
