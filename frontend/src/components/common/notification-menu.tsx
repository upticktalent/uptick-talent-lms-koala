import React from 'react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '../ui/dropdown-menu';
import { Button } from '../ui/button';
import { Bell } from 'lucide-react';
import { Badge } from '../ui/badge';
import { cn } from '@/lib/utils';

const notifications = [
  {
    title: 'New application submitted',
    desc: 'John Doe applied for Frontend track',
    time: '2 min ago',
    unread: true,
  },
  {
    title: 'Assessment submitted',
    desc: 'Jane Smith submitted her assessment',
    time: '1 hour ago',
    unread: true,
  },
  {
    title: 'Interview reminder',
    desc: 'Interview with Mike Johnson in 2 hours',
    time: '2 hours ago',
    unread: false,
  },
  {
    title: 'New mentor added',
    desc: 'Dr. Emily Rodriguez joined the team',
    time: '5 hours ago',
    unread: false,
  },
];

export default function NotificationMenu() {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          size="icon"
          className="relative rounded-full bg-transparent cursor-pointer hover:bg-gray-50 text-gray-600"
        >
          <Bell className="w-5 h-5" />
          <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full"></span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-80 bg-white">
        <DropdownMenuLabel className="flex items-center justify-between">
          <span>Notifications</span>
          <Badge variant="secondary" className="bg-blue-50 text-blue-700">
            3 new
          </Badge>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <div className="max-h-96 overflow-y-auto">
          {notifications.map((notification, index) => (
            <div
              key={index}
              className={cn(
                'p-3 hover:bg-gray-50 cursor-pointer border-l-2 transition-colors',
                notification.unread ? 'border-blue-500 bg-blue-50/50' : 'border-transparent',
              )}
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-900">{notification.title}</p>
                  <p className="text-xs text-gray-600 mt-1">{notification.desc}</p>
                  <p className="text-xs text-gray-400 mt-1">{notification.time}</p>
                </div>
                {notification.unread && (
                  <div className="w-2 h-2 bg-blue-500 rounded-full ml-2 mt-1" />
                )}
              </div>
            </div>
          ))}
        </div>
        <DropdownMenuSeparator />
        <div className="p-2">
          <Button className="w-full text-sm text-white bg-indigo-600 hover:bg-indigo-700 cursor-pointer">
            View all notifications
          </Button>
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
