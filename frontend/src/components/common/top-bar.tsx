'use client';

import { useState } from 'react';
import MobileSidebar from './mobile-sidebar-admin';
import { Search, Menu } from 'lucide-react';

import { Input } from '../ui/input';

import { Button } from '../ui/button';

import NotificationMenu from './notification-menu';
import HeaderProfile from './header-profile';
import Actions from './actions';

export function TopBar({ cohort }: { cohort: string }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const toggleSidebar = () => setSidebarOpen(!sidebarOpen);

  return (
    <>
      {/* HEADER */}
      <header className="h-16 bg-white border-b border-gray-100 flex items-center justify-between px-4 sm:px-6 sticky top-0 z-30">
        {/* Left Section  */}
        <div className="flex items-center gap-4">
          <Button
            size="icon"
            className="lg:hidden rounded-full bg-transparent cursor-pointer hover:bg-gray-50 text-gray-600"
            onClick={toggleSidebar}
          >
            <Menu className="w-5 h-5" />
          </Button>
        </div>

        {/* Search Bar */}
        <div className="flex-1 max-w-md hidden md:block">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <Input
              placeholder="Search applicants, mentors..."
              className="pl-10 border-gray-200 text-gray-900 focus-visible:ring-blue-500 bg-gray-50/50"
            />
          </div>
        </div>

        {/* Right Actions */}
        <div className="flex items-center gap-3">
          {/* Notifications */}
          <NotificationMenu />

          <Actions />

          {/* Profile */}
          <HeaderProfile />
        </div>
      </header>

      {/* MOBILE SIDEBAR OVERLAY */}

      {/* MOBILE SIDEBAR PANEL */}
      <MobileSidebar sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} cohort={cohort} />
    </>
  );
}
