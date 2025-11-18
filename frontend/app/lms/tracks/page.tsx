'use client';

import { useState } from 'react';
import Link from 'next/link';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { trackService } from '@/services/trackService';
import { useFetch } from '@/hooks/useFetch';
import { useUser } from '@/hooks/useUser';

export default function TracksPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const { isAdmin, isMentor, isStudent } = useUser();

  const {
    data: tracks,
    loading,
    error,
  } = useFetch(() => trackService.getTracks());

  const filteredTracks =
    tracks?.filter(
      (track: any) =>
        track.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        track.description.toLowerCase().includes(searchTerm.toLowerCase())
    ) || [];

  if (loading) {
    return (
      <div className='flex justify-center items-center min-h-64'>
        <div className='text-gray-600'>Loading tracks...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className='text-center text-red-600'>
        Failed to load tracks: {error}
      </div>
    );
  }

  return (
    <div className='space-y-6'>
      {/* Header */}
      <div className='flex justify-between items-center'>
        <div>
          <h1 className='text-2xl font-bold text-gray-900'>Learning Tracks</h1>
          <p className='text-gray-600'>
            {isStudent
              ? 'Your learning tracks and progress'
              : 'Manage and monitor learning tracks'}
          </p>
        </div>
        {isAdmin && (
          <Link href='/admin/tracks/new'>
            <Button>Create New Track</Button>
          </Link>
        )}
      </div>

      {/* Search */}
      <div className='max-w-md'>
        <Input
          type='text'
          placeholder='Search tracks...'
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      {/* Tracks Grid */}
      <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6'>
        {filteredTracks.length === 0 ? (
          <div className='col-span-full text-center text-gray-500 py-8'>
            {searchTerm
              ? 'No tracks found matching your search.'
              : 'No tracks available.'}
          </div>
        ) : (
          filteredTracks.map((track: any) => (
            <Card key={track._id} className='hover:shadow-md transition-shadow'>
              <CardHeader>
                <div className='flex items-center justify-between'>
                  <div
                    className='w-12 h-12 rounded-lg flex items-center justify-center text-white font-bold'
                    style={{ backgroundColor: track.color || '#3B82F6' }}
                  >
                    {track.name.charAt(0)}
                  </div>
                  {track.isActive ? (
                    <span className='px-2 py-1 bg-green-100 text-green-800 text-xs rounded-full'>
                      Active
                    </span>
                  ) : (
                    <span className='px-2 py-1 bg-gray-100 text-gray-800 text-xs rounded-full'>
                      Inactive
                    </span>
                  )}
                </div>
                <CardTitle className='text-lg'>{track.name}</CardTitle>
                <CardDescription className='line-clamp-2'>
                  {track.description}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className='space-y-3'>
                  <div className='flex justify-between text-sm text-gray-600'>
                    <span>Students:</span>
                    <span>{track.students?.length || 0}</span>
                  </div>
                  <div className='flex justify-between text-sm text-gray-600'>
                    <span>Mentors:</span>
                    <span>{track.mentors?.length || 0}</span>
                  </div>

                  <div className='pt-2'>
                    <Link href={`/lms/track/${track.slug}`}>
                      <Button className='w-full' size='sm'>
                        {isStudent ? 'Continue Learning' : 'View Track'}
                      </Button>
                    </Link>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>

      {/* Quick Stats */}
      {(isAdmin || isMentor) && (
        <Card>
          <CardHeader>
            <CardTitle>Track Statistics</CardTitle>
          </CardHeader>
          <CardContent>
            <div className='grid grid-cols-1 md:grid-cols-4 gap-4'>
              <div className='text-center'>
                <div className='text-2xl font-bold text-blue-600'>
                  {tracks?.length || 0}
                </div>
                <div className='text-sm text-gray-600'>Total Tracks</div>
              </div>
              <div className='text-center'>
                <div className='text-2xl font-bold text-green-600'>
                  {tracks?.filter((t: any) => t.isActive).length || 0}
                </div>
                <div className='text-sm text-gray-600'>Active Tracks</div>
              </div>
              <div className='text-center'>
                <div className='text-2xl font-bold text-purple-600'>
                  {tracks?.reduce(
                    (acc: number, track: any) =>
                      acc + (track.students?.length || 0),
                    0
                  ) || 0}
                </div>
                <div className='text-sm text-gray-600'>Total Students</div>
              </div>
              <div className='text-center'>
                <div className='text-2xl font-bold text-orange-600'>
                  {tracks?.reduce(
                    (acc: number, track: any) =>
                      acc + (track.mentors?.length || 0),
                    0
                  ) || 0}
                </div>
                <div className='text-sm text-gray-600'>Total Mentors</div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
