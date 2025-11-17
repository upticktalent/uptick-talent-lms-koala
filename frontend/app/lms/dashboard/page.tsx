'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { lmsService } from '@/services/lmsService';
import { trackService } from '@/services/trackService';
import { useUser } from '@/hooks/useUser';
import { useFetch } from '@/hooks/useFetch';
import { formatDate } from '@/utils/formatDate';
import Link from 'next/link';

export default function LMSDashboard() {
  const { user, isAdmin, isMentor, isStudent } = useUser();
  
  const { 
    data: dashboardStats, 
    loading: statsLoading, 
    error: statsError 
  } = useFetch(() => lmsService.getDashboardStats());

  const { 
    data: tracks, 
    loading: tracksLoading, 
    error: tracksError 
  } = useFetch(() => trackService.getTracks());

  const { 
    data: announcements, 
    loading: announcementsLoading, 
    error: announcementsError 
  } = useFetch(() => lmsService.getAnnouncements());

  const stats = dashboardStats || {
    totalStudents: 0,
    totalTracks: 0,
    activeApplications: 0,
    pendingAssessments: 0
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">
          Welcome back, {user?.firstName}!
        </h1>
        <p className="text-gray-600">
          Here&apos;s what&apos;s happening in your {user?.role === 'admin' ? 'system' : 'learning journey'} today.
        </p>
      </div>

      {/* Stats Cards - Only for Admin and Mentor */}
      {(isAdmin || isMentor) && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Students</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{statsLoading ? '...' : stats.totalStudents}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Active Tracks</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{statsLoading ? '...' : stats.totalTracks}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Pending Applications</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{statsLoading ? '...' : stats.activeApplications}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Pending Assessments</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{statsLoading ? '...' : stats.pendingAssessments}</div>
            </CardContent>
          </Card>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Announcements */}
        <Card>
          <CardHeader>
            <CardTitle>Recent Announcements</CardTitle>
            <CardDescription>Stay updated with the latest news</CardDescription>
          </CardHeader>
          <CardContent>
            {announcementsLoading ? (
              <div className="text-gray-500">Loading announcements...</div>
            ) : announcementsError ? (
              <div className="text-red-500">Failed to load announcements</div>
            ) : announcements && announcements.length > 0 ? (
              <div className="space-y-4">
                {announcements.slice(0, 3).map((announcement: any) => (
                  <div key={announcement._id} className="border-l-4 border-blue-500 pl-4">
                    <h4 className="font-medium text-gray-900">{announcement.title}</h4>
                    <p className="text-sm text-gray-600 mt-1">{announcement.content}</p>
                    <p className="text-xs text-gray-500 mt-2">
                      {formatDate(announcement.createdAt)}
                    </p>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-gray-500">No announcements available</div>
            )}
          </CardContent>
        </Card>

        {/* Quick Actions */}
        <Card>
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
            <CardDescription>Common tasks and shortcuts</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {isAdmin && (
              <>
                <Link href="/lms/recruitment/applications">
                  <Button variant="outline" className="w-full justify-start">
                    Review Applications
                  </Button>
                </Link>
                <Link href="/admin/tracks">
                  <Button variant="outline" className="w-full justify-start">
                    Manage Tracks
                  </Button>
                </Link>
                <Link href="/admin/students">
                  <Button variant="outline" className="w-full justify-start">
                    Manage Students
                  </Button>
                </Link>
              </>
            )}
            
            {isMentor && (
              <>
                <Link href="/lms/tracks">
                  <Button variant="outline" className="w-full justify-start">
                    View My Tracks
                  </Button>
                </Link>
                <Link href="/lms/recruitment/applications">
                  <Button variant="outline" className="w-full justify-start">
                    Review Applications
                  </Button>
                </Link>
              </>
            )}

            {isStudent && tracks && tracks.length > 0 && (
              <Link href={`/lms/track/${tracks[0].slug}`}>
                <Button variant="outline" className="w-full justify-start">
                  Go to My Track
                </Button>
              </Link>
            )}

            <Link href="/lms/tracks">
              <Button variant="outline" className="w-full justify-start">
                Browse All Tracks
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>

      {/* My Tracks - For Students */}
      {isStudent && (
        <Card>
          <CardHeader>
            <CardTitle>My Learning Path</CardTitle>
            <CardDescription>Your current track and progress</CardDescription>
          </CardHeader>
          <CardContent>
            {tracksLoading ? (
              <div className="text-gray-500">Loading your track...</div>
            ) : tracksError ? (
              <div className="text-red-500">Failed to load track information</div>
            ) : tracks && tracks.length > 0 ? (
              <div className="space-y-4">
                {tracks.map((track: any) => (
                  <div key={track._id} className="border rounded-lg p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <h4 className="font-medium text-gray-900">{track.name}</h4>
                        <p className="text-sm text-gray-600 mt-1">{track.description}</p>
                      </div>
                      <Link href={`/lms/track/${track.slug}`}>
                        <Button size="sm">Enter Track</Button>
                      </Link>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-gray-500">You are not enrolled in any tracks yet.</div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
