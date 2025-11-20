'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { assessmentService } from '@/services/assessmentService';
import { handleApiError } from '@/utils/handleApiError';
import { toast } from 'sonner';

interface ApplicationData {
  applicationId: string;
  applicant: {
    name: string;
    email: string;
  };
  track: {
    name: string;
  };
  status: string;
  eligible: boolean;
  reasons: {
    notShortlisted: boolean;
    alreadySubmitted: boolean;
  };
}

export default function AssessmentPage() {
  // Step 1: Application ID verification
  const [applicationId, setApplicationId] = useState('');
  const [applicationData, setApplicationData] =
    useState<ApplicationData | null>(null);
  const [verifyingApplication, setVerifyingApplication] = useState(false);
  const [verificationError, setVerificationError] = useState('');

  // Step 2: Assessment submission
  const [submissionType, setSubmissionType] = useState<'file' | 'url' | ''>('');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [linkUrl, setLinkUrl] = useState('');
  const [notes, setNotes] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const router = useRouter();

  const verifyApplication = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!applicationId.trim()) {
      setVerificationError('Please enter your application ID');
      return;
    }

    setVerifyingApplication(true);
    setVerificationError('');

    try {
      const response = await assessmentService.checkApplicationEligibility(
        applicationId
      );
      setApplicationData(response.data.data);

      if (!response.data.data.eligible) {
        const reasons = response.data.data.reasons;
        let errorMessage = 'You are not eligible to submit an assessment. ';

        if (reasons.notShortlisted) {
          errorMessage += 'Your application has not been shortlisted yet.';
        } else if (reasons.alreadySubmitted) {
          errorMessage +=
            'You have already submitted an assessment for this application.';
        }

        setVerificationError(errorMessage);
      }
    } catch (err) {
      setVerificationError(handleApiError(err));
    } finally {
      setVerifyingApplication(false);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Validate file size (10MB max)
      if (file.size > 10 * 1024 * 1024) {
        toast.error('File size must be less than 10MB');
        return;
      }

      // Validate file type
      const allowedTypes = [
        'application/pdf',
        'application/msword',
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        'text/plain',
        'application/zip',
        'application/x-zip-compressed',
      ];

      if (!allowedTypes.includes(file.type)) {
        toast.error(
          'Please upload a PDF, Word document, text file, or ZIP archive'
        );
        return;
      }

      setSelectedFile(file);
    }
  };

  const handleSubmitAssessment = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!submissionType) {
      toast.error('Please select a submission type');
      return;
    }

    if (submissionType === 'file' && !selectedFile) {
      toast.error('Please select a file to upload');
      return;
    }

    if (submissionType === 'url' && !linkUrl.trim()) {
      toast.error('Please enter a URL');
      return;
    }

    // Validate URL format if URL submission
    if (submissionType === 'url') {
      try {
        new URL(linkUrl);
      } catch {
        toast.error('Please enter a valid URL');
        return;
      }
    }

    setSubmitting(true);

    try {
      const formData = new FormData();
      formData.append('applicationId', applicationData!.applicationId);

      if (submissionType === 'file' && selectedFile) {
        formData.append('file', selectedFile);
      }

      if (submissionType === 'url' && linkUrl.trim()) {
        formData.append('linkUrl', linkUrl.trim());
      }

      if (notes.trim()) {
        formData.append('notes', notes.trim());
      }

      await assessmentService.submitAssessment(formData);

      toast.success('Assessment submitted successfully!');
      router.push(
        `/apply/assessment/success?id=${applicationData!.applicationId}`
      );
    } catch (err) {
      toast.error(handleApiError(err));
    } finally {
      setSubmitting(false);
    }
  };

  // Step 1: Application ID Verification Screen
  if (!applicationData) {
    return (
      <div className='min-h-screen bg-gray-50 flex items-center justify-center p-4'>
        <Card className='w-full max-w-md'>
          <CardHeader className='text-center'>
            <CardTitle className='text-2xl'>Assessment Submission</CardTitle>
            <CardDescription>
              Enter your application ID to verify eligibility and submit your
              assessment
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={verifyApplication} className='space-y-4'>
              <div className='space-y-2'>
                <Label htmlFor='applicationId'>Application ID</Label>
                <Input
                  id='applicationId'
                  type='text'
                  placeholder='Enter your application ID'
                  value={applicationId}
                  onChange={(e) => setApplicationId(e.target.value)}
                  required
                />
              </div>

              {verificationError && (
                <Alert variant='destructive'>
                  <AlertDescription>{verificationError}</AlertDescription>
                </Alert>
              )}

              <Button
                type='submit'
                className='w-full'
                disabled={verifyingApplication}
              >
                {verifyingApplication ? 'Verifying...' : 'Verify Application'}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Step 2: Assessment Submission Form (only if eligible)
  if (!applicationData.eligible) {
    return (
      <div className='min-h-screen bg-gray-50 flex items-center justify-center p-4'>
        <Card className='w-full max-w-md'>
          <CardHeader className='text-center'>
            <CardTitle className='text-2xl text-red-600'>
              Not Eligible
            </CardTitle>
          </CardHeader>
          <CardContent className='text-center space-y-4'>
            <p className='text-gray-600'>
              {applicationData.reasons.notShortlisted &&
                'Your application has not been shortlisted yet. Please wait for further communication.'}
              {applicationData.reasons.alreadySubmitted &&
                'You have already submitted an assessment for this application.'}
            </p>
            <Button variant='outline' onClick={() => setApplicationData(null)}>
              Try Another Application ID
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className='min-h-screen bg-gray-50 p-4'>
      <div className='max-w-2xl mx-auto'>
        {/* Application Info */}
        <Card className='mb-6'>
          <CardContent className='pt-6'>
            <div className='grid grid-cols-1 md:grid-cols-2 gap-4 text-sm'>
              <div>
                <span className='font-medium text-gray-500'>Applicant:</span>
                <p className='text-gray-900'>
                  {applicationData.applicant.name}
                </p>
              </div>
              <div>
                <span className='font-medium text-gray-500'>Track:</span>
                <p className='text-gray-900'>{applicationData.track.name}</p>
              </div>
              <div>
                <span className='font-medium text-gray-500'>Email:</span>
                <p className='text-gray-900'>
                  {applicationData.applicant.email}
                </p>
              </div>
              <div>
                <span className='font-medium text-gray-500'>Status:</span>
                <span className='px-2 py-1 bg-green-100 text-green-800 rounded-full text-xs font-medium'>
                  {applicationData.status}
                </span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Assessment Submission Form */}
        <Card>
          <CardHeader>
            <CardTitle>Submit Your Assessment</CardTitle>
            <CardDescription>
              Please submit your assessment either as a file upload or provide a
              link to your work.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmitAssessment} className='space-y-6'>
              {/* Submission Type Selection */}
              <div className='space-y-3'>
                <Label className='text-base font-medium'>Submission Type</Label>
                <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
                  <div
                    className={`border-2 rounded-lg p-4 cursor-pointer transition-colors ${
                      submissionType === 'file'
                        ? 'border-blue-500 bg-blue-50'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                    onClick={() => setSubmissionType('file')}
                  >
                    <div className='flex items-center space-x-3'>
                      <input
                        type='radio'
                        name='submissionType'
                        value='file'
                        checked={submissionType === 'file'}
                        onChange={(e) =>
                          setSubmissionType(e.target.value as 'file')
                        }
                        className='text-blue-600'
                      />
                      <div>
                        <div className='font-medium'>File Upload</div>
                        <div className='text-sm text-gray-500'>
                          Upload a PDF, Word doc, or ZIP file
                        </div>
                      </div>
                    </div>
                  </div>

                  <div
                    className={`border-2 rounded-lg p-4 cursor-pointer transition-colors ${
                      submissionType === 'url'
                        ? 'border-blue-500 bg-blue-50'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                    onClick={() => setSubmissionType('url')}
                  >
                    <div className='flex items-center space-x-3'>
                      <input
                        type='radio'
                        name='submissionType'
                        value='url'
                        checked={submissionType === 'url'}
                        onChange={(e) =>
                          setSubmissionType(e.target.value as 'url')
                        }
                        className='text-blue-600'
                      />
                      <div>
                        <div className='font-medium'>Link/URL</div>
                        <div className='text-sm text-gray-500'>
                          Provide a link to your work (GitHub, etc.)
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* File Upload */}
              {submissionType === 'file' && (
                <div className='space-y-2'>
                  <Label htmlFor='file'>Upload File</Label>
                  <Input
                    id='file'
                    type='file'
                    onChange={handleFileChange}
                    accept='.pdf,.doc,.docx,.txt,.zip'
                    className='file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100'
                  />
                  {selectedFile && (
                    <p className='text-sm text-gray-600'>
                      Selected: {selectedFile.name} (
                      {(selectedFile.size / 1024 / 1024).toFixed(2)} MB)
                    </p>
                  )}
                  <p className='text-xs text-gray-500'>
                    Supported formats: PDF, Word documents, text files, ZIP
                    archives. Max size: 10MB
                  </p>
                </div>
              )}

              {/* URL Input */}
              {submissionType === 'url' && (
                <div className='space-y-2'>
                  <Label htmlFor='url'>Project URL</Label>
                  <Input
                    id='url'
                    type='url'
                    placeholder='https://github.com/yourusername/your-project'
                    value={linkUrl}
                    onChange={(e) => setLinkUrl(e.target.value)}
                  />
                  <p className='text-xs text-gray-500'>
                    Provide a link to your GitHub repository, live demo, or
                    other relevant URL
                  </p>
                </div>
              )}

              {/* Notes */}
              <div className='space-y-2'>
                <Label htmlFor='notes'>Additional Notes (Optional)</Label>
                <Textarea
                  id='notes'
                  placeholder="Any additional information about your submission, setup instructions, or comments you'd like to share..."
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  maxLength={1000}
                  rows={4}
                />
                <p className='text-xs text-gray-500'>
                  {notes.length}/1000 characters
                </p>
              </div>

              {/* Warning */}
              <Alert>
                <AlertDescription>
                  <strong>Important:</strong> Please review your submission
                  carefully. You will not be able to modify your assessment
                  after submission.
                </AlertDescription>
              </Alert>

              {/* Submit Button */}
              <div className='flex space-x-4'>
                <Button
                  type='button'
                  variant='outline'
                  onClick={() => setApplicationData(null)}
                  disabled={submitting}
                >
                  Back
                </Button>
                <Button type='submit' className='flex-1' disabled={submitting}>
                  {submitting ? 'Submitting...' : 'Submit Assessment'}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
