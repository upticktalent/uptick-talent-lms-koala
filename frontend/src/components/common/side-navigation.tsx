'use client';

import { useCallback, useMemo } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useLocalStorage } from '@/hooks/useLocalStorage';
import { ChevronDown } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useNavigation } from '@/hooks/use-sidenav';

export interface NavigationLink {
  id: string;
  label: string;
  href: string;
  icon?: React.ComponentType<{ className?: string }>;
}

export interface NavigationItem {
  id: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  href?: string;
  children?: NavigationLink[];
  premium?: boolean;
}

interface NavigationProps {
  cohort?: string;
  className?: string;
}

export function Navigation({ cohort, className }: NavigationProps) {
  const items = useNavigation();
  const pathname = usePathname();
  const [expandedItems, setExpandedItems] = useLocalStorage<string[]>('sidebar-expanded-items', [
    'recruitment',
  ]);

  const isActivePath = useCallback(
    (href?: string) => {
      if (!href) return false;
      if (href === `/admin/${cohort?.toLowerCase().replace(' ', '-')}`) return pathname === href;
      return pathname === href || pathname.startsWith(`${href}/`);
    },
    [pathname, cohort],
  );

  const toggleExpanded = useCallback(
    (id: string) => {
      setExpandedItems(prev =>
        prev.includes(id) ? prev.filter(item => item !== id) : [...prev, id],
      );
    },
    [setExpandedItems],
  );

  const navigationItems = useMemo(() => {
    if (!cohort) return items;

    return items.map(item => {
      if (item.children) {
        return {
          ...item,
          children: item.children.map(child => {
            const href = child.href?.replace(
              '/admin',
              `/admin/${cohort.toLowerCase().replace(' ', '-')}`,
            );
            return { ...child, href };
          }),
        };
      }
      return {
        ...item,
        href: item.href?.replace('/admin', `/admin/${cohort.toLowerCase().replace(' ', '-')}`),
      };
    });
  }, [cohort, items]);

  return (
    <nav className={cn('flex-1 overflow-y-auto space-y-1 mt-5', className)}>
      {navigationItems.map(item => {
        const Icon = item.icon;
        const hasChildren = Boolean(item.children?.length);
        const isExpanded = expandedItems.includes(item.id);
        const isParentActive =
          isActivePath(item.href) ||
          (hasChildren && item.children!.some(child => isActivePath(child.href)));

        return (
          <div key={item.id} className="relative">
            {hasChildren ? (
              <>
                <button
                  onClick={() => toggleExpanded(item.id)}
                  className={cn(
                    'w-full flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-200 group/nav-item',
                    isParentActive
                      ? 'bg-blue-50 text-blue-700 border border-blue-100'
                      : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900 border border-transparent',
                  )}
                  aria-expanded={isExpanded}
                  aria-controls={`submenu-${item.id}`}
                >
                  <Icon
                    className={cn(
                      'w-4 h-4 shrink-0 transition-colors',
                      isParentActive
                        ? 'text-blue-600'
                        : 'text-gray-400 group-hover/nav-item:text-gray-600',
                    )}
                  />
                  <span className="flex-1 text-left text-sm font-medium">{item.label}</span>

                  <ChevronDown
                    className={cn(
                      'w-4 h-4 transition-transform duration-200 text-gray-400',
                      isExpanded ? 'rotate-180' : '',
                    )}
                  />
                </button>

                {hasChildren && (
                  <div
                    id={`submenu-${item.id}`}
                    className={cn(
                      'ml-4 overflow-hidden transition-all duration-300 ease-in-out border-l border-gray-200',
                      isExpanded ? 'max-h-96 opacity-100 mt-1' : 'max-h-0 opacity-0',
                    )}
                  >
                    <div className="space-y-1 py-1 ml-2">
                      {item.children!.map(child => {
                        const ChildIcon = child.icon;
                        const isChildActive = isActivePath(child.href);
                        return (
                          <Link
                            key={child.id}
                            href={child.href}
                            className={cn(
                              'flex items-center gap-3 px-3 py-2 text-sm rounded-lg transition-all duration-200 group/child',
                              isChildActive
                                ? 'bg-blue-50 text-blue-700 border-l-2 border-blue-500'
                                : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900',
                            )}
                            aria-current={isChildActive ? 'page' : undefined}
                          >
                            {ChildIcon ? (
                              <ChildIcon className="w-3.5 h-3.5 shrink-0" />
                            ) : (
                              <div className="w-1.5 h-1.5 rounded-full bg-gray-300 group-hover/child:bg-gray-400" />
                            )}
                            <span className="font-medium">{child.label}</span>
                          </Link>
                        );
                      })}
                    </div>
                  </div>
                )}
              </>
            ) : (
              <Link
                href={item.href!}
                className={cn(
                  'flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-200 group/nav-item border border-transparent',
                  isParentActive
                    ? 'bg-blue-50 text-blue-700 border border-blue-100'
                    : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900 hover:border-gray-200',
                )}
                aria-current={isParentActive ? 'page' : undefined}
              >
                <Icon
                  className={cn(
                    'w-4 h-4 shrink-0 transition-colors',
                    isParentActive
                      ? 'text-blue-600'
                      : 'text-gray-400 group-hover/nav-item:text-gray-600',
                  )}
                />
                <span className="flex-1 text-sm font-medium">{item.label}</span>
              </Link>
            )}
          </div>
        );
      })}
    </nav>
  );
}
