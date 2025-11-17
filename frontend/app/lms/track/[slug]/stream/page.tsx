'use client';

import { useParams } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { trackService } from '@/services/trackService';
import { useFetch } from '@/hooks/useFetch';
import { useUser } from '@/hooks/useUser';
import { formatDate, timeAgo } from '@/utils/formatDate';

export default function TrackStreamPage() {
  const params = useParams();
  const slug = params.slug as string;
  const { isAdmin, isMentor } = useUser();

  const { 
    data: track, 
    loading: trackLoading 
  } = useFetch(() => trackService.getTrackBySlug(slug));

  const { 
    data: stream, 
    loading: streamLoading, 
    error: streamError 
  } = useFetch(() => {
    if (track?._id) {
      return trackService.getTrackStream(track._id);
    }
    return Promise.resolve(null);
  }, { immediate: false });

  // Mock announcements for demonstration
  const announcements = [
    {
      _id: '1',
      title: 'Week 3: JavaScript Fundamentals',
      content: 'This week we\'ll be diving deep into JavaScript fundamentals including variables, functions, and control flow. Please review the pre-reading materials before our next session.',
      priority: 'high',
      authorId: 'mentor1',
      authorName: 'John Smith',
      createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
    },
    {
      _id: '2',
      title: 'Assignment 2 Due Date Extended',
      content: 'Due to popular request, we\'re extending the deadline for Assignment 2 by 2 days. The new due date is Friday, November 22nd at 11:59 PM.',
      priority: 'medium',
      authorId: 'mentor1',
      authorName: 'John Smith',
      createdAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
    },
    {
      _id: '3',
      title: 'Welcome to Frontend Development Track!',
      content: 'Welcome everyone to the Frontend Development track! We\'re excited to have you on this journey. Over the next 12 weeks, you\'ll learn HTML, CSS, JavaScript, and React. Let\'s build amazing things together!',
      priority: 'low',
      authorId: 'mentor1',
      authorName: 'John Smith',
      createdAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
    },
  ];

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'border-l-red-500 bg-red-50';
      case 'medium': return 'border-l-yellow-500 bg-yellow-50';
      case 'low': return 'border-l-blue-500 bg-blue-50';
      default: return 'border-l-gray-500 bg-gray-50';
    }
  };

  const getPriorityBadge = (priority: string) => {
    switch (priority) {
      case 'high': return 'bg-red-100 text-red-800';
      case 'medium': return 'bg-yellow-100 text-yellow-800';
      case 'low': return 'bg-blue-100 text-blue-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  if (trackLoading) {
    return (
      <div className="flex justify-center items-center min-h-64">
        <div className="text-gray-600">Loading track...</div>
      </div>
    );
  }

  if (!track) {
    return (
      <div className="text-center text-red-600">
        Track not found
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            {track.name} - Stream
          </h1>
          <p className="text-gray-600">Latest announcements and updates</p>
        </div>
        {(isAdmin || isMentor) && (
          <Button>
            New Announcement
          </Button>
        )}
      </div>

      {/* Stream Content */}
      <div className="space-y-4">
        {announcements.length === 0 ? (
          <Card>
            <CardContent className="pt-6 text-center text-gray-500">
              No announcements yet. Check back later for updates!
            </CardContent>
          </Card>
        ) : (
          announcements.map((announcement) => (
            <Card key={announcement._id} className={`border-l-4 ${getPriorityColor(announcement.priority)}`}>
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <CardTitle className="text-lg">{announcement.title}</CardTitle>
                      <span className={`px-2 py-1 text-xs rounded-full ${getPriorityBadge(announcement.priority)}`}>
                        {announcement.priority.toUpperCase()}
                      </span>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <span>By {announcement.authorName}</span>
                      <span>•</span>
                      <span>{timeAgo(announcement.createdAt)}</span>
                    </div>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-gray-700 leading-relaxed">
                  {announcement.content}
                </p>
                
                {/* Action buttons for admins/mentors */}
                {(isAdmin || isMentor) && (
                  <div className="flex gap-2 mt-4 pt-4 border-t">
                    <Button variant="outline" size="sm">
                      Edit
                    </Button>
                    <Button variant="outline" size="sm">
                      Delete
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          ))
        )}
      </div>

      {/* Stream Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="text-2xl font-bold text-blue-600">
              {announcements.length}
            </div>
            <p className="text-xs text-muted-foreground">Total Announcements</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-2xl font-bold text-red-600">
              {announcements.filter(a => a.priority === 'high').length}
            </div>
            <p className="text-xs text-muted-foreground">High Priority</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-2xl font-bold text-green-600">
              {announcements.filter(a => 
                new Date(a.createdAt) > new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
              ).length}
            </div>
            <p className="text-xs text-muted-foreground">This Week</p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
