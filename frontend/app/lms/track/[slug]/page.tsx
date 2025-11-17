'use client';

import { useParams } from 'next/navigation';
import Link from 'next/link';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { trackService } from '@/services/trackService';
import { useFetch } from '@/hooks/useFetch';
import { useUser } from '@/hooks/useUser';

export default function TrackPage() {
  const params = useParams();
  const slug = params.slug as string;
  const { isStudent } = useUser();

  const {
    data: track,
    loading,
    error,
  } = useFetch(() => trackService.getTrackBySlug(slug));

  if (loading) {
    return (
      <div className='flex justify-center items-center min-h-64'>
        <div className='text-gray-600'>Loading track...</div>
      </div>
    );
  }

  if (error || !track) {
    return (
      <div className='text-center'>
        <div className='text-red-600 font-medium mb-2'>Track Not Found</div>
        <p className='text-gray-600 mb-4'>
          The requested track could not be found.
        </p>
        <Link href='/lms/tracks'>
          <Button variant='outline'>Back to Tracks</Button>
        </Link>
      </div>
    );
  }

  const navigationItems = [
    {
      title: 'Stream',
      description: 'Latest announcements and updates',
      href: `/lms/track/${slug}/stream`,
      icon: '📢',
    },
    {
      title: 'Classroom',
      description: 'Learning materials and resources',
      href: `/lms/track/${slug}/classroom`,
      icon: '📚',
    },
    {
      title: 'People',
      description: 'Students and mentors in this track',
      href: `/lms/track/${slug}/people`,
      icon: '👥',
    },
    {
      title: 'Grades',
      description: isStudent
        ? 'Your progress and grades'
        : 'Student grades and progress',
      href: `/lms/track/${slug}/grades`,
      icon: '📊',
    },
  ];

  return (
    <div className='space-y-6'>
      {/* Track Header */}
      <div className='bg-white rounded-lg border p-6'>
        <div className='flex items-center gap-4'>
          <div
            className='w-16 h-16 rounded-lg flex items-center justify-center text-white text-2xl font-bold'
            style={{ backgroundColor: track.color || '#3B82F6' }}
          >
            {track.name.charAt(0)}
          </div>
          <div className='flex-1'>
            <h1 className='text-2xl font-bold text-gray-900'>{track.name}</h1>
            <p className='text-gray-600 mt-1'>{track.description}</p>
            <div className='flex items-center gap-4 mt-3 text-sm text-gray-500'>
              <span>{track.students?.length || 0} Students</span>
              <span>{track.mentors?.length || 0} Mentors</span>
              <span
                className={`px-2 py-1 rounded-full text-xs ${
                  track.isActive
                    ? 'bg-green-100 text-green-800'
                    : 'bg-gray-100 text-gray-800'
                }`}
              >
                {track.isActive ? 'Active' : 'Inactive'}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Navigation Cards */}
      <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4'>
        {navigationItems.map((item) => (
          <Link key={item.href} href={item.href}>
            <Card className='hover:shadow-md transition-shadow cursor-pointer h-full'>
              <CardHeader className='pb-3'>
                <div className='text-2xl mb-2'>{item.icon}</div>
                <CardTitle className='text-lg'>{item.title}</CardTitle>
                <CardDescription className='text-sm'>
                  {item.description}
                </CardDescription>
              </CardHeader>
            </Card>
          </Link>
        ))}
      </div>

      {/* Quick Stats */}
      <div className='grid grid-cols-1 md:grid-cols-3 gap-6'>
        <Card>
          <CardHeader>
            <CardTitle className='text-lg'>Recent Activity</CardTitle>
          </CardHeader>
          <CardContent>
            <div className='space-y-3'>
              <div className='flex items-center gap-3'>
                <div className='w-2 h-2 bg-blue-500 rounded-full'></div>
                <div className='text-sm text-gray-600'>
                  New learning material uploaded
                </div>
              </div>
              <div className='flex items-center gap-3'>
                <div className='w-2 h-2 bg-green-500 rounded-full'></div>
                <div className='text-sm text-gray-600'>
                  Assignment deadline approaching
                </div>
              </div>
              <div className='flex items-center gap-3'>
                <div className='w-2 h-2 bg-purple-500 rounded-full'></div>
                <div className='text-sm text-gray-600'>
                  New announcement posted
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className='text-lg'>Mentors</CardTitle>
          </CardHeader>
          <CardContent>
            {track.mentors && track.mentors.length > 0 ? (
              <div className='space-y-2'>
                {track.mentors.slice(0, 3).map((mentor: any) => (
                  <div key={mentor._id} className='flex items-center gap-3'>
                    <div className='w-8 h-8 bg-blue-500 text-white rounded-full flex items-center justify-center text-sm font-medium'>
                      {mentor.firstName?.[0]}
                      {mentor.lastName?.[0]}
                    </div>
                    <div className='text-sm'>
                      {mentor.firstName} {mentor.lastName}
                    </div>
                  </div>
                ))}
                {track.mentors.length > 3 && (
                  <div className='text-sm text-gray-500'>
                    +{track.mentors.length - 3} more
                  </div>
                )}
              </div>
            ) : (
              <div className='text-sm text-gray-500'>No mentors assigned</div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className='text-lg'>Progress</CardTitle>
          </CardHeader>
          <CardContent>
            <div className='space-y-3'>
              <div>
                <div className='flex justify-between text-sm mb-1'>
                  <span>Completion</span>
                  <span>75%</span>
                </div>
                <div className='w-full bg-gray-200 rounded-full h-2'>
                  <div
                    className='bg-blue-500 h-2 rounded-full'
                    style={{ width: '75%' }}
                  ></div>
                </div>
              </div>
              <div className='text-sm text-gray-600'>
                12 of 16 lessons completed
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
