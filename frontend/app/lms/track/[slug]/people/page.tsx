'use client';

import { useParams } from 'next/navigation';
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
import { useState } from 'react';

export default function TrackPeoplePage() {
  const params = useParams();
  const slug = params.slug as string;
  const { isAdmin, isMentor } = useUser();
  const [searchTerm, setSearchTerm] = useState('');

  const { data: track, loading: trackLoading } = useFetch(() =>
    trackService.getTrackBySlug(slug)
  );

  const { data: participants, loading: participantsLoading } = useFetch(
    () => {
      if (track?._id) {
        return trackService.getTrackParticipants(track._id);
      }
      return Promise.resolve(null);
    },
    { immediate: false }
  );

  // Mock data for demonstration
  const mentors = [
    {
      _id: '1',
      firstName: 'John',
      lastName: 'Smith',
      email: 'john.smith@upticktalent.com',
      profilePicture: null,
      isActive: true,
      specialization: 'Frontend Development',
      experience: '5+ years',
    },
    {
      _id: '2',
      firstName: 'Sarah',
      lastName: 'Johnson',
      email: 'sarah.johnson@upticktalent.com',
      profilePicture: null,
      isActive: true,
      specialization: 'UI/UX Design',
      experience: '3+ years',
    },
  ];

  const students = [
    {
      _id: '1',
      firstName: 'Alice',
      lastName: 'Williams',
      email: 'alice.williams@student.com',
      profilePicture: null,
      isActive: true,
      progress: 85,
      joinedAt: '2024-01-15',
    },
    {
      _id: '2',
      firstName: 'Bob',
      lastName: 'Brown',
      email: 'bob.brown@student.com',
      profilePicture: null,
      isActive: true,
      progress: 72,
      joinedAt: '2024-01-15',
    },
    {
      _id: '3',
      firstName: 'Charlie',
      lastName: 'Davis',
      email: 'charlie.davis@student.com',
      profilePicture: null,
      isActive: true,
      progress: 91,
      joinedAt: '2024-01-15',
    },
    {
      _id: '4',
      firstName: 'Diana',
      lastName: 'Miller',
      email: 'diana.miller@student.com',
      profilePicture: null,
      isActive: false,
      progress: 45,
      joinedAt: '2024-01-15',
    },
    {
      _id: '5',
      firstName: 'Eve',
      lastName: 'Wilson',
      email: 'eve.wilson@student.com',
      profilePicture: null,
      isActive: true,
      progress: 68,
      joinedAt: '2024-01-15',
    },
    {
      _id: '6',
      firstName: 'Frank',
      lastName: 'Moore',
      email: 'frank.moore@student.com',
      profilePicture: null,
      isActive: true,
      progress: 79,
      joinedAt: '2024-01-15',
    },
  ];

  const filteredStudents = students.filter(
    (student) =>
      `${student.firstName} ${student.lastName}`
        .toLowerCase()
        .includes(searchTerm.toLowerCase()) ||
      student.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const filteredMentors = mentors.filter(
    (mentor) =>
      `${mentor.firstName} ${mentor.lastName}`
        .toLowerCase()
        .includes(searchTerm.toLowerCase()) ||
      mentor.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getInitials = (firstName: string, lastName: string) => {
    return `${firstName[0]}${lastName[0]}`;
  };

  const getProgressColor = (progress: number) => {
    if (progress >= 80) return 'bg-green-500';
    if (progress >= 60) return 'bg-yellow-500';
    return 'bg-red-500';
  };

  if (trackLoading) {
    return (
      <div className='flex justify-center items-center min-h-64'>
        <div className='text-gray-600'>Loading track...</div>
      </div>
    );
  }

  if (!track) {
    return <div className='text-center text-red-600'>Track not found</div>;
  }

  return (
    <div className='space-y-6'>
      {/* Header */}
      <div className='flex justify-between items-center'>
        <div>
          <h1 className='text-2xl font-bold text-gray-900'>
            {track.name} - People
          </h1>
          <p className='text-gray-600'>Students and mentors in this track</p>
        </div>
        {isAdmin && (
          <div className='flex gap-2'>
            <Button variant='outline'>Assign Mentor</Button>
            <Button>Add Student</Button>
          </div>
        )}
      </div>

      {/* Search */}
      <div className='max-w-md'>
        <Input
          type='text'
          placeholder='Search people...'
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      <div className='grid grid-cols-1 lg:grid-cols-2 gap-6'>
        {/* Mentors */}
        <div className='space-y-4'>
          <div className='flex items-center justify-between'>
            <h2 className='text-xl font-semibold text-gray-900'>
              Mentors ({filteredMentors.length})
            </h2>
          </div>

          {filteredMentors.length === 0 ? (
            <Card>
              <CardContent className='pt-6 text-center text-gray-500'>
                {searchTerm
                  ? 'No mentors found matching your search.'
                  : 'No mentors assigned to this track.'}
              </CardContent>
            </Card>
          ) : (
            <div className='space-y-3'>
              {filteredMentors.map((mentor) => (
                <Card key={mentor._id}>
                  <CardContent className='pt-4'>
                    <div className='flex items-center gap-4'>
                      <div className='w-12 h-12 bg-blue-500 text-white rounded-full flex items-center justify-center font-medium'>
                        {getInitials(mentor.firstName, mentor.lastName)}
                      </div>
                      <div className='flex-1'>
                        <div className='flex items-center gap-2 mb-1'>
                          <h3 className='font-medium text-gray-900'>
                            {mentor.firstName} {mentor.lastName}
                          </h3>
                          <span
                            className={`px-2 py-1 text-xs rounded-full ${
                              mentor.isActive
                                ? 'bg-green-100 text-green-800'
                                : 'bg-gray-100 text-gray-800'
                            }`}
                          >
                            {mentor.isActive ? 'Active' : 'Inactive'}
                          </span>
                        </div>
                        <p className='text-sm text-gray-600 mb-1'>
                          {mentor.email}
                        </p>
                        <div className='text-xs text-gray-500'>
                          <span className='font-medium'>Specialization:</span>{' '}
                          {mentor.specialization}
                        </div>
                        <div className='text-xs text-gray-500'>
                          <span className='font-medium'>Experience:</span>{' '}
                          {mentor.experience}
                        </div>
                      </div>
                      {(isAdmin || isMentor) && (
                        <Button variant='outline' size='sm'>
                          Contact
                        </Button>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>

        {/* Students */}
        <div className='space-y-4'>
          <div className='flex items-center justify-between'>
            <h2 className='text-xl font-semibold text-gray-900'>
              Students ({filteredStudents.length})
            </h2>
          </div>

          {filteredStudents.length === 0 ? (
            <Card>
              <CardContent className='pt-6 text-center text-gray-500'>
                {searchTerm
                  ? 'No students found matching your search.'
                  : 'No students enrolled in this track.'}
              </CardContent>
            </Card>
          ) : (
            <div className='space-y-3'>
              {filteredStudents.map((student) => (
                <Card key={student._id}>
                  <CardContent className='pt-4'>
                    <div className='flex items-center gap-4'>
                      <div className='w-12 h-12 bg-purple-500 text-white rounded-full flex items-center justify-center font-medium'>
                        {getInitials(student.firstName, student.lastName)}
                      </div>
                      <div className='flex-1'>
                        <div className='flex items-center gap-2 mb-1'>
                          <h3 className='font-medium text-gray-900'>
                            {student.firstName} {student.lastName}
                          </h3>
                          <span
                            className={`px-2 py-1 text-xs rounded-full ${
                              student.isActive
                                ? 'bg-green-100 text-green-800'
                                : 'bg-gray-100 text-gray-800'
                            }`}
                          >
                            {student.isActive ? 'Active' : 'Inactive'}
                          </span>
                        </div>
                        <p className='text-sm text-gray-600 mb-2'>
                          {student.email}
                        </p>

                        {/* Progress Bar */}
                        <div className='space-y-1'>
                          <div className='flex justify-between text-xs text-gray-600'>
                            <span>Progress</span>
                            <span>{student.progress}%</span>
                          </div>
                          <div className='w-full bg-gray-200 rounded-full h-2'>
                            <div
                              className={`h-2 rounded-full ${getProgressColor(
                                student.progress
                              )}`}
                              style={{ width: `${student.progress}%` }}
                            ></div>
                          </div>
                        </div>
                      </div>
                      {(isAdmin || isMentor) && (
                        <div className='flex gap-1'>
                          <Button variant='outline' size='sm'>
                            View Profile
                          </Button>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* People Stats */}
      <div className='grid grid-cols-1 md:grid-cols-4 gap-4'>
        <Card>
          <CardContent className='pt-6'>
            <div className='text-2xl font-bold text-blue-600'>
              {mentors.length}
            </div>
            <p className='text-xs text-muted-foreground'>Total Mentors</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className='pt-6'>
            <div className='text-2xl font-bold text-purple-600'>
              {students.length}
            </div>
            <p className='text-xs text-muted-foreground'>Total Students</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className='pt-6'>
            <div className='text-2xl font-bold text-green-600'>
              {students.filter((s) => s.isActive).length}
            </div>
            <p className='text-xs text-muted-foreground'>Active Students</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className='pt-6'>
            <div className='text-2xl font-bold text-orange-600'>
              {Math.round(
                students.reduce((acc, s) => acc + s.progress, 0) /
                  students.length
              ) || 0}
              %
            </div>
            <p className='text-xs text-muted-foreground'>Avg Progress</p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
