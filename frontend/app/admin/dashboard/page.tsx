'use client';

import Link from 'next/link';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { lmsService } from '@/services/lmsService';
import { applicantService } from '@/services/applicantService';
import { trackService } from '@/services/trackService';
import { useFetch } from '@/hooks/useFetch';

export default function AdminDashboard() {
  const { 
    data: dashboardStats, 
    loading: statsLoading 
  } = useFetch(() => lmsService.getDashboardStats());

  const { 
    data: applications 
  } = useFetch(() => applicantService.getApplications());

  const { 
    data: tracks 
  } = useFetch(() => trackService.getTracks());

  const { 
    data: cohorts 
  } = useFetch(() => lmsService.getCohorts());

  const stats = {
    totalStudents: dashboardStats?.totalStudents || 0,
    totalTracks: tracks?.length || 0,
    totalApplications: applications?.length || 0,
    activeCohorts: cohorts?.filter((c: any) => c.isActive).length || 0,
    pendingApplications: applications?.filter((a: any) => a.status === 'pending').length || 0,
    shortlistedApplicants: applications?.filter((a: any) => a.status === 'shortlisted').length || 0,
  };

  const quickActions = [
    {
      title: 'Manage Students',
      description: 'View and manage all students in the system',
      href: '/admin/students',
      icon: '👥',
      color: 'bg-blue-500',
    },
    {
      title: 'Manage Tracks',
      description: 'Create and configure learning tracks',
      href: '/admin/tracks',
      icon: '📚',
      color: 'bg-green-500',
    },
    {
      title: 'Manage Cohorts',
      description: 'Create and manage cohort cycles',
      href: '/admin/cohorts',
      icon: '🎓',
      color: 'bg-purple-500',
    },
    {
      title: 'Active Cohort',
      description: 'Manage the currently active cohort',
      href: '/admin/active-cohort',
      icon: '⭐',
      color: 'bg-orange-500',
    },
    {
      title: 'Review Applications',
      description: 'Process pending applications',
      href: '/lms/recruitment/applications',
      icon: '📋',
      color: 'bg-red-500',
    },
    {
      title: 'LMS Dashboard',
      description: 'Switch to LMS management view',
      href: '/lms/dashboard',
      icon: '🎯',
      color: 'bg-indigo-500',
    },
  ];

  return (
    <div className="space-y-8">
      {/* Welcome Section */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Admin Dashboard</h1>
        <p className="text-gray-600 mt-2">
          Welcome to the system administration panel. Manage all aspects of Uptick Talent LMS.
        </p>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Students</CardTitle>
            <div className="text-2xl">👥</div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{statsLoading ? '...' : stats.totalStudents}</div>
            <p className="text-xs text-muted-foreground">Enrolled students</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Learning Tracks</CardTitle>
            <div className="text-2xl">📚</div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalTracks}</div>
            <p className="text-xs text-muted-foreground">Available tracks</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Cohorts</CardTitle>
            <div className="text-2xl">🎓</div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.activeCohorts}</div>
            <p className="text-xs text-muted-foreground">Currently running</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Applications</CardTitle>
            <div className="text-2xl">📋</div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalApplications}</div>
            <p className="text-xs text-muted-foreground">All time applications</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending Reviews</CardTitle>
            <div className="text-2xl">⏳</div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-600">{stats.pendingApplications}</div>
            <p className="text-xs text-muted-foreground">Need attention</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Shortlisted</CardTitle>
            <div className="text-2xl">✨</div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">{stats.shortlistedApplicants}</div>
            <p className="text-xs text-muted-foreground">Ready for assessment</p>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <div>
        <h2 className="text-xl font-semibold text-gray-900 mb-4">Quick Actions</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {quickActions.map((action) => (
            <Link key={action.href} href={action.href}>
              <Card className="hover:shadow-lg transition-shadow cursor-pointer h-full">
                <CardHeader>
                  <div className="flex items-center gap-4">
                    <div className={`w-12 h-12 rounded-lg ${action.color} text-white flex items-center justify-center text-2xl`}>
                      {action.icon}
                    </div>
                    <div>
                      <CardTitle className="text-lg">{action.title}</CardTitle>
                    </div>
                  </div>
                  <CardDescription className="mt-2">
                    {action.description}
                  </CardDescription>
                </CardHeader>
              </Card>
            </Link>
          ))}
        </div>
      </div>

      {/* Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Recent Applications</CardTitle>
            <CardDescription>Latest application submissions</CardDescription>
          </CardHeader>
          <CardContent>
            {applications && applications.length > 0 ? (
              <div className="space-y-3">
                {applications.slice(0, 5).map((app: any) => (
                  <div key={app._id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div>
                      <div className="font-medium text-gray-900">
                        {app.firstName} {app.lastName}
                      </div>
                      <div className="text-sm text-gray-600 capitalize">
                        {app.preferredTrack?.replace('-', ' ')}
                      </div>
                    </div>
                    <span className={`px-2 py-1 text-xs rounded-full ${
                      app.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                      app.status === 'shortlisted' ? 'bg-blue-100 text-blue-800' :
                      'bg-gray-100 text-gray-800'
                    }`}>
                      {app.status.replace('_', ' ').toUpperCase()}
                    </span>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-gray-500 text-center py-4">
                No recent applications
              </div>
            )}
            <div className="mt-4">
              <Link href="/lms/recruitment/applications">
                <Button variant="outline" size="sm" className="w-full">
                  View All Applications
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>System Status</CardTitle>
            <CardDescription>Current system health and status</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                  <span className="text-sm font-medium">Database</span>
                </div>
                <span className="text-sm text-green-600">Healthy</span>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                  <span className="text-sm font-medium">Email Service</span>
                </div>
                <span className="text-sm text-green-600">Operational</span>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                  <span className="text-sm font-medium">File Storage</span>
                </div>
                <span className="text-sm text-green-600">Available</span>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
                  <span className="text-sm font-medium">API Performance</span>
                </div>
                <span className="text-sm text-yellow-600">Moderate</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
