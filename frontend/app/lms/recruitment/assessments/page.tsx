'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useFetch } from '@/hooks/useFetch';
import { assessmentService } from '@/services/assessmentService';
import { RoleGuard } from '@/middleware/roleGuard';
import { formatDate } from '@/utils/formatDate';
import Link from 'next/link';
import { Button } from '@/components/ui/button';

export default function AssessmentsPage() {
  const { 
    data: assessments, 
    loading, 
    error 
  } = useFetch(() => assessmentService.getAssessments());

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'submitted': return 'bg-blue-100 text-blue-800';
      case 'graded': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-64">
        <div className="text-gray-600">Loading assessments...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center text-red-600">
        Failed to load assessments: {error}
      </div>
    );
  }

  return (
    <RoleGuard allowedRoles={['admin', 'mentor']}>
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Assessments</h1>
          <p className="text-gray-600">Monitor and grade applicant assessments</p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card>
            <CardContent className="pt-6">
              <div className="text-2xl font-bold text-yellow-600">
                {assessments?.filter((a: any) => a.status === 'pending').length || 0}
              </div>
              <p className="text-xs text-muted-foreground">Pending</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="text-2xl font-bold text-blue-600">
                {assessments?.filter((a: any) => a.status === 'submitted').length || 0}
              </div>
              <p className="text-xs text-muted-foreground">Awaiting Grade</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="text-2xl font-bold text-green-600">
                {assessments?.filter((a: any) => a.status === 'graded').length || 0}
              </div>
              <p className="text-xs text-muted-foreground">Graded</p>
            </CardContent>
          </Card>
        </div>

        {/* Assessments List */}
        <div className="space-y-4">
          {!assessments || assessments.length === 0 ? (
            <Card>
              <CardContent className="pt-6 text-center text-gray-500">
                No assessments available.
              </CardContent>
            </Card>
          ) : (
            assessments.map((assessment: any) => (
              <Card key={assessment._id}>
                <CardContent className="pt-6">
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-4">
                        <div>
                          <h3 className="font-semibold text-gray-900">
                            Assessment #{assessment._id.slice(-6)}
                          </h3>
                          <p className="text-sm text-gray-600">
                            Applicant: {assessment.applicantId}
                          </p>
                        </div>
                        <span className={`px-2 py-1 text-xs rounded-full ${getStatusColor(assessment.status)}`}>
                          {assessment.status.toUpperCase()}
                        </span>
                      </div>
                      
                      <div className="mt-3 grid grid-cols-1 md:grid-cols-4 gap-4 text-sm text-gray-600">
                        <div>
                          <span className="font-medium">Questions:</span>
                          <span className="ml-1">{assessment.questions?.length || 0}</span>
                        </div>
                        <div>
                          <span className="font-medium">Score:</span>
                          <span className="ml-1">
                            {assessment.score !== undefined ? `${assessment.score}%` : 'Not graded'}
                          </span>
                        </div>
                        <div>
                          <span className="font-medium">Submitted:</span>
                          <span className="ml-1">
                            {assessment.submittedAt 
                              ? formatDate(assessment.submittedAt) 
                              : 'Not submitted'
                            }
                          </span>
                        </div>
                        <div>
                          <span className="font-medium">Graded:</span>
                          <span className="ml-1">
                            {assessment.gradedAt 
                              ? formatDate(assessment.gradedAt) 
                              : 'Not graded'
                            }
                          </span>
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex gap-2">
                      <Link href={`/lms/recruitment/assessments/${assessment._id}`}>
                        <Button variant="outline" size="sm">
                          {assessment.status === 'submitted' ? 'Grade' : 'View'}
                        </Button>
                      </Link>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>
      </div>
    </RoleGuard>
  );
}
