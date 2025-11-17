'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { assessmentService } from '@/services/assessmentService';
import { handleApiError } from '@/utils/handleApiError';
import { IAssessment } from '@/types';

export default function AssessmentPage() {
  const [assessment, setAssessment] = useState<IAssessment | null>(null);
  const [answers, setAnswers] = useState<Record<string, any>>({});
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  const router = useRouter();
  const searchParams = useSearchParams();
  const applicantId = searchParams.get('applicant');

  useEffect(() => {
    if (applicantId) {
      fetchAssessment();
    }
  }, [applicantId]);

  const fetchAssessment = async () => {
    try {
      const response = await assessmentService.getAssessment(applicantId!);
      setAssessment(response.data.data);
    } catch (err) {
      setError(handleApiError(err));
    } finally {
      setLoading(false);
    }
  };

  const handleAnswerChange = (questionId: string, answer: any) => {
    setAnswers(prev => ({
      ...prev,
      [questionId]: answer
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setError('');

    try {
      await assessmentService.submitAssessment({
        applicantId: applicantId!,
        answers
      });
      
      router.push(`/apply/status?id=${applicantId}`);
    } catch (err) {
      setError(handleApiError(err));
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-64">
        <div className="text-gray-600">Loading assessment...</div>
      </div>
    );
  }

  if (error && !assessment) {
    return (
      <Card>
        <CardContent className="pt-6">
          <div className="text-center">
            <div className="text-red-600 font-medium mb-2">Error</div>
            <p className="text-gray-600">{error}</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!assessment) {
    return (
      <Card>
        <CardContent className="pt-6">
          <div className="text-center">
            <div className="text-gray-600 font-medium mb-2">Assessment Not Found</div>
            <p className="text-gray-600">
              No assessment is available at this time.
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Technical Assessment</CardTitle>
        <CardDescription>
          Please complete all questions below. Take your time and provide thoughtful answers.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-8">
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
              {error}
            </div>
          )}

          {assessment.questions.map((question, index) => (
            <div key={question._id} className="border rounded-lg p-6">
              <div className="mb-4">
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  Question {index + 1}
                </h3>
                <p className="text-gray-700">{question.question}</p>
                <div className="text-sm text-gray-500 mt-1">
                  Points: {question.points}
                </div>
              </div>

              {question.type === 'multiple-choice' && question.options && (
                <div className="space-y-2">
                  {question.options.map((option, optionIndex) => (
                    <label key={optionIndex} className="flex items-center">
                      <input
                        type="radio"
                        name={question._id}
                        value={option}
                        onChange={(e) => handleAnswerChange(question._id, e.target.value)}
                        className="mr-3"
                        required
                      />
                      <span className="text-gray-700">{option}</span>
                    </label>
                  ))}
                </div>
              )}

              {question.type === 'short-answer' && (
                <Input
                  type="text"
                  onChange={(e) => handleAnswerChange(question._id, e.target.value)}
                  placeholder="Enter your answer..."
                  required
                />
              )}

              {(question.type === 'essay' || question.type === 'code') && (
                <textarea
                  rows={question.type === 'code' ? 8 : 6}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  onChange={(e) => handleAnswerChange(question._id, e.target.value)}
                  placeholder={
                    question.type === 'code' 
                      ? 'Write your code here...' 
                      : 'Write your detailed answer here...'
                  }
                  style={question.type === 'code' ? { fontFamily: 'monospace' } : {}}
                  required
                />
              )}
            </div>
          ))}

          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
            <div className="text-yellow-800">
              <strong>Important:</strong> Please review all your answers before submitting. 
              You will not be able to modify your responses after submission.
            </div>
          </div>

          <Button type="submit" className="w-full" disabled={submitting}>
            {submitting ? 'Submitting Assessment...' : 'Submit Assessment'}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
