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
import { trackService } from '@/services/trackService';
import { useFetch } from '@/hooks/useFetch';
import { useUser } from '@/hooks/useUser';
import { formatDate } from '@/utils/formatDate';

export default function TrackClassroomPage() {
  const params = useParams();
  const slug = params.slug as string;
  const { isAdmin, isMentor } = useUser();

  const { data: track, loading: trackLoading } = useFetch(() =>
    trackService.getTrackBySlug(slug)
  );

  const { data: classroom, loading: classroomLoading } = useFetch(
    () => {
      if (track?._id) {
        return trackService.getTrackClassroom(track._id);
      }
      return Promise.resolve(null);
    },
    { immediate: false }
  );

  // Mock classroom data for demonstration
  const materials = [
    {
      _id: '1',
      title: 'HTML Fundamentals - Complete Guide',
      type: 'document',
      url: '/materials/html-fundamentals.pdf',
      description:
        'A comprehensive guide to HTML elements, attributes, and semantic markup.',
      uploadedAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
    },
    {
      _id: '2',
      title: 'CSS Grid and Flexbox Tutorial',
      type: 'video',
      url: 'https://example.com/video/css-grid-flexbox',
      description:
        'Learn modern CSS layout techniques with practical examples.',
      uploadedAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
    },
    {
      _id: '3',
      title: 'JavaScript ES6+ Features',
      type: 'slides',
      url: '/materials/js-es6-slides.pptx',
      description:
        'Presentation covering arrow functions, destructuring, modules, and more.',
      uploadedAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
    },
    {
      _id: '4',
      title: 'MDN Web Docs',
      type: 'link',
      url: 'https://developer.mozilla.org',
      description: 'The ultimate reference for web technologies.',
      uploadedAt: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString(),
    },
  ];

  const assignments = [
    {
      _id: '1',
      title: 'Build a Personal Portfolio Website',
      description:
        'Create a responsive personal portfolio website using HTML, CSS, and JavaScript. Include sections for about, projects, and contact information.',
      dueDate: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000).toISOString(),
      maxScore: 100,
      submissions: 8,
      totalStudents: 12,
      createdAt: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000).toISOString(),
    },
    {
      _id: '2',
      title: 'JavaScript Calculator',
      description:
        'Build a functional calculator application using vanilla JavaScript. Implement basic arithmetic operations and a clean user interface.',
      dueDate: new Date(Date.now() + 12 * 24 * 60 * 60 * 1000).toISOString(),
      maxScore: 80,
      submissions: 3,
      totalStudents: 12,
      createdAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
    },
  ];

  const getMaterialIcon = (type: string) => {
    switch (type) {
      case 'document':
        return '📄';
      case 'video':
        return '🎥';
      case 'slides':
        return '📊';
      case 'link':
        return '🔗';
      default:
        return '📎';
    }
  };

  const getMaterialColor = (type: string) => {
    switch (type) {
      case 'document':
        return 'bg-blue-100 text-blue-800';
      case 'video':
        return 'bg-red-100 text-red-800';
      case 'slides':
        return 'bg-orange-100 text-orange-800';
      case 'link':
        return 'bg-green-100 text-green-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  if (trackLoading) {
    return (
      <div className='flex justify-center items-center min-h-64'>
        <div className='text-gray-600'>Loading classroom...</div>
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
            {track.name} - Classroom
          </h1>
          <p className='text-gray-600'>Learning materials and assignments</p>
        </div>
        {(isAdmin || isMentor) && (
          <div className='flex gap-2'>
            <Button variant='outline'>Upload Material</Button>
            <Button>Create Assignment</Button>
          </div>
        )}
      </div>

      <div className='grid grid-cols-1 lg:grid-cols-2 gap-6'>
        {/* Learning Materials */}
        <div className='space-y-4'>
          <h2 className='text-xl font-semibold text-gray-900'>
            Learning Materials
          </h2>

          {materials.length === 0 ? (
            <Card>
              <CardContent className='pt-6 text-center text-gray-500'>
                No materials available yet.
              </CardContent>
            </Card>
          ) : (
            <div className='space-y-3'>
              {materials.map((material) => (
                <Card
                  key={material._id}
                  className='hover:shadow-md transition-shadow'
                >
                  <CardContent className='pt-4'>
                    <div className='flex items-start gap-4'>
                      <div className='text-2xl'>
                        {getMaterialIcon(material.type)}
                      </div>
                      <div className='flex-1'>
                        <div className='flex items-center gap-2 mb-2'>
                          <h3 className='font-medium text-gray-900'>
                            {material.title}
                          </h3>
                          <span
                            className={`px-2 py-1 text-xs rounded-full ${getMaterialColor(
                              material.type
                            )}`}
                          >
                            {material.type.toUpperCase()}
                          </span>
                        </div>
                        <p className='text-sm text-gray-600 mb-3'>
                          {material.description}
                        </p>
                        <div className='flex items-center justify-between'>
                          <span className='text-xs text-gray-500'>
                            Uploaded {formatDate(material.uploadedAt)}
                          </span>
                          <Button size='sm' variant='outline'>
                            {material.type === 'link' ? 'Visit' : 'Download'}
                          </Button>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>

        {/* Assignments */}
        <div className='space-y-4'>
          <h2 className='text-xl font-semibold text-gray-900'>Assignments</h2>

          {assignments.length === 0 ? (
            <Card>
              <CardContent className='pt-6 text-center text-gray-500'>
                No assignments available yet.
              </CardContent>
            </Card>
          ) : (
            <div className='space-y-3'>
              {assignments.map((assignment) => (
                <Card
                  key={assignment._id}
                  className='hover:shadow-md transition-shadow'
                >
                  <CardHeader className='pb-3'>
                    <div className='flex items-start justify-between'>
                      <div className='flex-1'>
                        <CardTitle className='text-lg'>
                          {assignment.title}
                        </CardTitle>
                        <div className='flex items-center gap-4 mt-2 text-sm text-gray-600'>
                          <span>Due: {formatDate(assignment.dueDate)}</span>
                          <span>Max Score: {assignment.maxScore}</span>
                        </div>
                      </div>
                      <div
                        className={`px-2 py-1 text-xs rounded-full ${
                          new Date(assignment.dueDate) < new Date()
                            ? 'bg-red-100 text-red-800'
                            : 'bg-green-100 text-green-800'
                        }`}
                      >
                        {new Date(assignment.dueDate) < new Date()
                          ? 'Overdue'
                          : 'Active'}
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <p className='text-sm text-gray-700 mb-4'>
                      {assignment.description}
                    </p>

                    <div className='flex items-center justify-between'>
                      <div className='text-sm text-gray-600'>
                        {assignment.submissions}/{assignment.totalStudents}{' '}
                        submissions
                      </div>
                      <div className='flex gap-2'>
                        <Button size='sm' variant='outline'>
                          View Details
                        </Button>
                        {(isAdmin || isMentor) && (
                          <Button size='sm'>Grade Submissions</Button>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Classroom Stats */}
      <div className='grid grid-cols-1 md:grid-cols-4 gap-4'>
        <Card>
          <CardContent className='pt-6'>
            <div className='text-2xl font-bold text-blue-600'>
              {materials.length}
            </div>
            <p className='text-xs text-muted-foreground'>Learning Materials</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className='pt-6'>
            <div className='text-2xl font-bold text-green-600'>
              {assignments.length}
            </div>
            <p className='text-xs text-muted-foreground'>Assignments</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className='pt-6'>
            <div className='text-2xl font-bold text-purple-600'>
              {assignments.reduce((acc, a) => acc + a.submissions, 0)}
            </div>
            <p className='text-xs text-muted-foreground'>Total Submissions</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className='pt-6'>
            <div className='text-2xl font-bold text-orange-600'>
              {Math.round(
                (assignments.reduce((acc, a) => acc + a.submissions, 0) /
                  (assignments.length * (assignments[0]?.totalStudents || 1))) *
                  100
              ) || 0}
              %
            </div>
            <p className='text-xs text-muted-foreground'>Completion Rate</p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
