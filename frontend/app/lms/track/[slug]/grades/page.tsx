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

interface ImockGrades {
  _id: string;
  assignmentName: string;
  type: string;
  score: number;
  maxScore: number;
  feedback: string;
  gradedBy: string;
  gradedAt: string;
  dueDate: string;
}

export default function TrackGradesPage() {
  const params = useParams();
  const slug = params.slug as string;
  const { user, isAdmin, isMentor, isStudent } = useUser();

  const { data: track, loading: trackLoading } = useFetch(() =>
    trackService.getTrackBySlug(slug)
  );

  const { data: grades, loading: gradesLoading } = useFetch(
    () => {
      if (track?._id) {
        return trackService.getTrackGrades(
          track._id,
          isStudent ? user?._id : undefined
        );
      }
      return Promise.resolve(null);
    },
    { immediate: false }
  );

  // Mock grades data for demonstration
  const mockGrades = isStudent
    ? [
        {
          _id: '1',
          assignmentName: 'Personal Portfolio Website',
          type: 'assignment',
          score: 85,
          maxScore: 100,
          feedback:
            'Great work on the responsive design! Consider improving the color scheme for better accessibility.',
          gradedBy: 'John Smith',
          gradedAt: new Date(
            Date.now() - 3 * 24 * 60 * 60 * 1000
          ).toISOString(),
          dueDate: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
        },
        {
          _id: '2',
          assignmentName: 'JavaScript Calculator',
          type: 'assignment',
          score: 92,
          maxScore: 80,
          feedback:
            'Excellent implementation! You went above and beyond with the advanced features.',
          gradedBy: 'Sarah Johnson',
          gradedAt: new Date(
            Date.now() - 1 * 24 * 60 * 60 * 1000
          ).toISOString(),
          dueDate: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
        },
        {
          _id: '3',
          assignmentName: 'HTML & CSS Quiz',
          type: 'assessment',
          score: 78,
          maxScore: 100,
          feedback:
            'Good understanding of the basics. Review CSS Grid and Flexbox concepts.',
          gradedBy: 'John Smith',
          gradedAt: new Date(
            Date.now() - 10 * 24 * 60 * 60 * 1000
          ).toISOString(),
          dueDate: new Date(
            Date.now() - 12 * 24 * 60 * 60 * 1000
          ).toISOString(),
        },
      ]
    : [
        // Mock data for mentors/admins viewing all students
        {
          studentName: 'Alice Williams',
          studentEmail: 'alice.williams@student.com',
          grades: [
            { assignment: 'Portfolio', score: 88, maxScore: 100 },
            { assignment: 'Calculator', score: 95, maxScore: 80 },
            { assignment: 'Quiz', score: 82, maxScore: 100 },
          ],
          average: 88.3,
        },
        {
          studentName: 'Bob Brown',
          studentEmail: 'bob.brown@student.com',
          grades: [
            { assignment: 'Portfolio', score: 75, maxScore: 100 },
            { assignment: 'Calculator', score: 68, maxScore: 80 },
            { assignment: 'Quiz', score: 71, maxScore: 100 },
          ],
          average: 71.3,
        },
        {
          studentName: 'Charlie Davis',
          studentEmail: 'charlie.davis@student.com',
          grades: [
            { assignment: 'Portfolio', score: 95, maxScore: 100 },
            { assignment: 'Calculator', score: 78, maxScore: 80 },
            { assignment: 'Quiz', score: 89, maxScore: 100 },
          ],
          average: 87.3,
        },
      ];

  const getGradeColor = (score: number, maxScore: number) => {
    const percentage = (score / maxScore) * 100;
    if (percentage >= 90) return 'text-green-600';
    if (percentage >= 80) return 'text-blue-600';
    if (percentage >= 70) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getGradeBadge = (score: number, maxScore: number) => {
    const percentage = (score / maxScore) * 100;
    if (percentage >= 90) return 'bg-green-100 text-green-800';
    if (percentage >= 80) return 'bg-blue-100 text-blue-800';
    if (percentage >= 70) return 'bg-yellow-100 text-yellow-800';
    return 'bg-red-100 text-red-800';
  };

  if (trackLoading) {
    return (
      <div className='flex justify-center items-center min-h-64'>
        <div className='text-gray-600'>Loading grades...</div>
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
            {track.name} - {isStudent ? 'My Grades' : 'Student Grades'}
          </h1>
          <p className='text-gray-600'>
            {isStudent
              ? 'Your academic progress and feedback'
              : 'Monitor student performance and progress'}
          </p>
        </div>
        {(isAdmin || isMentor) && <Button>Export Grades</Button>}
      </div>

      {isStudent ? (
        /* Student View - Individual Grades */
        <div className='space-y-6'>
          {/* Grade Summary */}
          <div className='grid grid-cols-1 md:grid-cols-3 gap-4'>
            <Card>
              <CardContent className='pt-6'>
                <div className='text-2xl font-bold text-blue-600'>
                  {Math.round(
                    (mockGrades as ImockGrades[]).reduce(
                      (acc, g) => acc + (g.score / g.maxScore) * 100,
                      0
                    ) / (mockGrades as ImockGrades[]).length
                  )}
                  %
                </div>
                <p className='text-xs text-muted-foreground'>Overall Average</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className='pt-6'>
                <div className='text-2xl font-bold text-green-600'>
                  {mockGrades.length}
                </div>
                <p className='text-xs text-muted-foreground'>
                  Assignments Graded
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className='pt-6'>
                <div className='text-2xl font-bold text-purple-600'>
                  {(mockGrades as ImockGrades[]).reduce(
                    (acc, g) => acc + g.score,
                    0
                  )}{' '}
                  /{' '}
                  {(mockGrades as ImockGrades[]).reduce(
                    (acc, g) => acc + g.maxScore,
                    0
                  )}
                </div>
                <p className='text-xs text-muted-foreground'>Total Points</p>
              </CardContent>
            </Card>
          </div>

          {/* Individual Grades */}
          <div className='space-y-4'>
            <h2 className='text-xl font-semibold text-gray-900'>
              Assignment Grades
            </h2>
            {(mockGrades as ImockGrades[]).map((grade) => (
              <Card key={grade._id}>
                <CardHeader>
                  <div className='flex items-start justify-between'>
                    <div className='flex-1'>
                      <CardTitle className='text-lg'>
                        {grade.assignmentName}
                      </CardTitle>
                      <div className='flex items-center gap-4 mt-2 text-sm text-gray-600'>
                        <span>Due: {formatDate(grade.dueDate)}</span>
                        <span>Graded: {formatDate(grade.gradedAt)}</span>
                        <span>Graded by: {grade.gradedBy}</span>
                      </div>
                    </div>
                    <div className='text-right'>
                      <div
                        className={`text-2xl font-bold ${getGradeColor(
                          grade.score,
                          grade.maxScore
                        )}`}
                      >
                        {grade.score}/{grade.maxScore}
                      </div>
                      <span
                        className={`px-2 py-1 text-xs rounded-full ${getGradeBadge(
                          grade.score,
                          grade.maxScore
                        )}`}
                      >
                        {Math.round((grade.score / grade.maxScore) * 100)}%
                      </span>
                    </div>
                  </div>
                </CardHeader>
                {grade.feedback && (
                  <CardContent>
                    <div className='bg-blue-50 border border-blue-200 rounded-lg p-4'>
                      <h4 className='font-medium text-blue-900 mb-2'>
                        Feedback
                      </h4>
                      <p className='text-blue-800 text-sm'>{grade.feedback}</p>
                    </div>
                  </CardContent>
                )}
              </Card>
            ))}
          </div>
        </div>
      ) : (
        /* Mentor/Admin View - All Students */
        <div className='space-y-6'>
          {/* Class Statistics */}
          <div className='grid grid-cols-1 md:grid-cols-4 gap-4'>
            <Card>
              <CardContent className='pt-6'>
                <div className='text-2xl font-bold text-blue-600'>
                  {mockGrades.length}
                </div>
                <p className='text-xs text-muted-foreground'>Total Students</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className='pt-6'>
                <div className='text-2xl font-bold text-green-600'>
                  {Math.round(
                    mockGrades.reduce(
                      (acc: number, s: any) => acc + s.average,
                      0
                    ) / mockGrades.length
                  )}
                  %
                </div>
                <p className='text-xs text-muted-foreground'>Class Average</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className='pt-6'>
                <div className='text-2xl font-bold text-purple-600'>
                  {mockGrades.filter((s: any) => s.average >= 80).length}
                </div>
                <p className='text-xs text-muted-foreground'>Above 80%</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className='pt-6'>
                <div className='text-2xl font-bold text-red-600'>
                  {mockGrades.filter((s: any) => s.average < 70).length}
                </div>
                <p className='text-xs text-muted-foreground'>Need Support</p>
              </CardContent>
            </Card>
          </div>

          {/* Student Grades List */}
          <div className='space-y-4'>
            <h2 className='text-xl font-semibold text-gray-900'>
              Student Performance
            </h2>
            {mockGrades.map((student: any, index) => (
              <Card key={index}>
                <CardContent className='pt-6'>
                  <div className='flex items-center justify-between mb-4'>
                    <div>
                      <h3 className='font-semibold text-gray-900'>
                        {student.studentName}
                      </h3>
                      <p className='text-sm text-gray-600'>
                        {student.studentEmail}
                      </p>
                    </div>
                    <div className='text-right'>
                      <div
                        className={`text-xl font-bold ${getGradeColor(
                          student.average,
                          100
                        )}`}
                      >
                        {student.average.toFixed(1)}%
                      </div>
                      <span
                        className={`px-2 py-1 text-xs rounded-full ${getGradeBadge(
                          student.average,
                          100
                        )}`}
                      >
                        Overall
                      </span>
                    </div>
                  </div>

                  <div className='grid grid-cols-1 md:grid-cols-3 gap-4'>
                    {student.grades.map((grade: any, gradeIndex: number) => (
                      <div
                        key={gradeIndex}
                        className='bg-gray-50 rounded-lg p-3'
                      >
                        <div className='flex justify-between items-center'>
                          <span className='text-sm font-medium text-gray-700'>
                            {grade.assignment}
                          </span>
                          <span
                            className={`text-sm font-bold ${getGradeColor(
                              grade.score,
                              grade.maxScore
                            )}`}
                          >
                            {grade.score}/{grade.maxScore}
                          </span>
                        </div>
                        <div className='text-xs text-gray-500 mt-1'>
                          {Math.round((grade.score / grade.maxScore) * 100)}%
                        </div>
                      </div>
                    ))}
                  </div>

                  <div className='flex gap-2 mt-4 pt-4 border-t'>
                    <Button variant='secondary' size='sm'>
                      View Details
                    </Button>
                    <Button variant='secondary' size='sm'>
                      Send Feedback
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
