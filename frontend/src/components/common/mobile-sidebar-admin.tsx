'use client';

import React from 'react';
import { Button } from '../ui/button';
import { X, Settings } from 'lucide-react';
import { cn } from '@/lib/utils';
import Image from 'next/image';
import Link from 'next/link';
import { AdminLogo } from '../../../public/images';
import { Navigation } from './side-navigation';

interface MobileSidebarProps {
  sidebarOpen: boolean;
  setSidebarOpen: (isOpen: boolean) => void;
  cohort?: string;
}

export default function MobileSidebar({ sidebarOpen, setSidebarOpen, cohort }: MobileSidebarProps) {
  const closeSidebar = () => setSidebarOpen(false);

  return (
    <>
      {/* Overlay */}
      <div
        className={cn(
          'fixed inset-0 bg-black/40 z-40 transition-all duration-300 lg:hidden',
          sidebarOpen ? 'opacity-100 visible' : 'opacity-0 invisible',
        )}
        onClick={closeSidebar}
      />

      {/* Sidebar */}
      <aside
        className={cn(
          'fixed top-0 left-0 w-80 h-full bg-white shadow-xl z-50 transform transition-transform duration-300 lg:hidden flex flex-col',
          sidebarOpen ? 'translate-x-0' : '-translate-x-full',
        )}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-100">
          <div className="flex items-center gap-3">
            <Image src={AdminLogo} alt="logo" className="w-40" />
          </div>
          <Button
            size="icon"
            onClick={closeSidebar}
            className="cursor-pointer bg-transparent rounded-full hover:bg-gray-50 text-gray-600"
          >
            <X className="w-5 h-5" />
          </Button>
        </div>

        {/* Navigation */}
        <div className="flex-1 p-4 overflow-y-auto">
          <Navigation cohort={cohort} className="space-y-1" />
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-gray-100">
          <Link
            href="/admin/settings"
            onClick={closeSidebar}
            className="flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-200 text-gray-600 hover:bg-gray-50 hover:text-gray-900 mb-2"
          >
            <Settings className="w-4 h-4 shrink-0" />
            <span className="text-sm font-medium">Settings</span>
          </Link>

          <div className="flex items-center gap-3 p-2">
            <div className="relative">
              <div className="w-8 h-8 rounded-full bg-indigo-600 flex items-center justify-center text-white text-sm font-semibold shadow-sm">
                A
              </div>
              <div className="absolute -bottom-1 -right-1 w-3 h-3 bg-green-400 rounded-full border-2 border-white" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-gray-900 font-medium text-sm truncate">Admin User</p>
              <p className="text-gray-500 text-xs truncate">admin@fellowship.com</p>
            </div>
          </div>
        </div>
      </aside>
    </>
  );
}
