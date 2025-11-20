'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Alert, AlertDescription } from '@/components/ui/alert';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { applicantService } from '@/services/applicantService';
import { handleApiError } from '@/utils/handleApiError';
import { toast } from 'sonner';

interface Track {
  _id: string;
  trackId: string;
  name: string;
  description: string;
}

interface Cohort {
  _id: string;
  cohortNumber: string;
  name: string;
  description: string;
  isAcceptingApplications: boolean;
  startDate: string;
  endDate: string;
}

export default function ApplyPage() {
  // Form state
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phoneNumber: '',
    gender: '',
    country: '',
    state: '',
    educationalQualification: '',
    tools: [] as string[],
    trackId: '',
    cohortNumber: '',
    referralSource: '',
    motivation: '',
  });

  const [cvFile, setCvFile] = useState<File | null>(null);
  const [toolInput, setToolInput] = useState('');

  // Data states
  const [tracks, setTracks] = useState<Track[]>([]);
  const [cohorts, setCohorts] = useState<Cohort[]>([]);

  // UI states
  const [loading, setLoading] = useState(false);
  const [dataLoading, setDataLoading] = useState(true);
  const [error, setError] = useState('');

  const router = useRouter();

  useEffect(() => {
    loadInitialData();
  }, []);

  const loadInitialData = async () => {
    try {
      const [tracksResponse, cohortsResponse] = await Promise.all([
        applicantService.getTracks(),
        applicantService.getCohorts(),
      ]);

      setTracks(tracksResponse.data.data || []);
      setCohorts(cohortsResponse.data.data || []);
    } catch (err) {
      toast.error('Failed to load application data. Please refresh the page.');
    } finally {
      setDataLoading(false);
    }
  };

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  const handleSelectChange = (name: string, value: string) => {
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Validate file size (5MB max)
      if (file.size > 5 * 1024 * 1024) {
        toast.error('CV file size must be less than 5MB');
        return;
      }

      // Validate file type
      const allowedTypes = [
        'application/pdf',
        'application/msword',
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      ];

      if (!allowedTypes.includes(file.type)) {
        toast.error('Please upload a PDF or Word document');
        return;
      }

      setCvFile(file);
    }
  };

  const addTool = () => {
    if (toolInput.trim() && !formData.tools.includes(toolInput.trim())) {
      setFormData((prev) => ({
        ...prev,
        tools: [...prev.tools, toolInput.trim()],
      }));
      setToolInput('');
    }
  };

  const removeTool = (toolToRemove: string) => {
    setFormData((prev) => ({
      ...prev,
      tools: prev.tools.filter((tool) => tool !== toolToRemove),
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!cvFile) {
      toast.error('Please upload your CV');
      return;
    }

    if (formData.tools.length === 0) {
      toast.error('Please add at least one skill/tool');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const formDataToSend = new FormData();

      // Add all form fields
      Object.entries(formData).forEach(([key, value]) => {
        if (Array.isArray(value)) {
          value.forEach((item) => formDataToSend.append(`${key}[]`, item));
        } else {
          formDataToSend.append(key, value);
        }
      });

      // Add CV file
      formDataToSend.append('cv', cvFile);

      const response = await applicantService.submitApplication(formDataToSend);
      const applicationId = response.data.data.applicationId;

      toast.success('Application submitted successfully!');
      router.push(`/apply/success?id=${applicationId}`);
    } catch (err) {
      setError(handleApiError(err));
      toast.error(handleApiError(err));
    } finally {
      setLoading(false);
    }
  };

  if (dataLoading) {
    return (
      <div className='min-h-screen bg-gray-50 flex items-center justify-center'>
        <div className='text-center'>
          <div className='animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600 mx-auto'></div>
          <p className='mt-4 text-gray-600'>Loading application form...</p>
        </div>
      </div>
    );
  }

  return (
    <div className='min-h-screen bg-gray-50 p-4'>
      <div className='max-w-4xl mx-auto'>
        <Card>
          <CardHeader className='text-center'>
            <CardTitle className='text-3xl font-bold text-gray-900'>
              Apply to Uptick Talent LMS
            </CardTitle>
            <CardDescription className='text-lg'>
              Complete the application form below to start your journey with us
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className='space-y-8'>
              {error && (
                <Alert variant='destructive'>
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}

              {/* Personal Information */}
              <div className='space-y-6'>
                <div className='border-b pb-4'>
                  <h3 className='text-xl font-semibold text-gray-900'>
                    Personal Information
                  </h3>
                  <p className='text-sm text-gray-600 mt-1'>
                    Please provide your basic personal details
                  </p>
                </div>

                <div className='grid grid-cols-1 md:grid-cols-2 gap-6'>
                  <div className='space-y-2'>
                    <Label htmlFor='firstName'>First Name *</Label>
                    <Input
                      id='firstName'
                      name='firstName'
                      type='text'
                      value={formData.firstName}
                      onChange={handleInputChange}
                      required
                      maxLength={50}
                    />
                  </div>
                  <div className='space-y-2'>
                    <Label htmlFor='lastName'>Last Name *</Label>
                    <Input
                      id='lastName'
                      name='lastName'
                      type='text'
                      value={formData.lastName}
                      onChange={handleInputChange}
                      required
                      maxLength={50}
                    />
                  </div>
                </div>

                <div className='grid grid-cols-1 md:grid-cols-2 gap-6'>
                  <div className='space-y-2'>
                    <Label htmlFor='email'>Email Address *</Label>
                    <Input
                      id='email'
                      name='email'
                      type='email'
                      value={formData.email}
                      onChange={handleInputChange}
                      required
                    />
                  </div>
                  <div className='space-y-2'>
                    <Label htmlFor='phoneNumber'>Phone Number *</Label>
                    <Input
                      id='phoneNumber'
                      name='phoneNumber'
                      type='tel'
                      value={formData.phoneNumber}
                      onChange={handleInputChange}
                      placeholder='+234-xxx-xxx-xxxx'
                      required
                    />
                  </div>
                </div>

                <div className='grid grid-cols-1 md:grid-cols-3 gap-6'>
                  <div className='space-y-2'>
                    <Label htmlFor='gender'>Gender *</Label>
                    <Select
                      onValueChange={(value) =>
                        handleSelectChange('gender', value)
                      }
                    >
                      <SelectTrigger>
                        <SelectValue placeholder='Select gender' />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value='male'>Male</SelectItem>
                        <SelectItem value='female'>Female</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className='space-y-2'>
                    <Label htmlFor='country'>Country *</Label>
                    <Input
                      id='country'
                      name='country'
                      type='text'
                      value={formData.country}
                      onChange={handleInputChange}
                      placeholder='Nigeria'
                      required
                    />
                  </div>
                  <div className='space-y-2'>
                    <Label htmlFor='state'>State *</Label>
                    <Input
                      id='state'
                      name='state'
                      type='text'
                      value={formData.state}
                      onChange={handleInputChange}
                      placeholder='Lagos'
                      required
                    />
                  </div>
                </div>
              </div>

              {/* Educational Background */}
              <div className='space-y-6'>
                <div className='border-b pb-4'>
                  <h3 className='text-xl font-semibold text-gray-900'>
                    Educational Background
                  </h3>
                  <p className='text-sm text-gray-600 mt-1'>
                    Tell us about your educational qualifications
                  </p>
                </div>

                <div className='space-y-2'>
                  <Label htmlFor='educationalQualification'>
                    Educational Qualification
                  </Label>
                  <Textarea
                    id='educationalQualification'
                    name='educationalQualification'
                    value={formData.educationalQualification}
                    onChange={handleInputChange}
                    placeholder='e.g., BSc Computer Science, University of Lagos (2020)'
                    rows={3}
                    maxLength={200}
                  />
                  <p className='text-xs text-gray-500'>
                    {formData.educationalQualification.length}/200 characters
                  </p>
                </div>
              </div>

              {/* Skills and Tools */}
              <div className='space-y-6'>
                <div className='border-b pb-4'>
                  <h3 className='text-xl font-semibold text-gray-900'>
                    Skills & Tools
                  </h3>
                  <p className='text-sm text-gray-600 mt-1'>
                    Add the programming languages, frameworks, and tools you're
                    familiar with
                  </p>
                </div>

                <div className='space-y-4'>
                  <div className='flex gap-2'>
                    <Input
                      type='text'
                      placeholder='e.g., JavaScript, React, Python'
                      value={toolInput}
                      onChange={(e) => setToolInput(e.target.value)}
                      onKeyPress={(e) => {
                        if (e.key === 'Enter') {
                          e.preventDefault();
                          addTool();
                        }
                      }}
                    />
                    <Button type='button' onClick={addTool} variant='outline'>
                      Add
                    </Button>
                  </div>

                  {formData.tools.length > 0 && (
                    <div className='flex flex-wrap gap-2'>
                      {formData.tools.map((tool, index) => (
                        <span
                          key={index}
                          className='inline-flex items-center px-3 py-1 rounded-full text-sm bg-blue-100 text-blue-800'
                        >
                          {tool}
                          <button
                            type='button'
                            onClick={() => removeTool(tool)}
                            className='ml-2 text-blue-600 hover:text-blue-800'
                          >
                            ×
                          </button>
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              {/* Program Selection */}
              <div className='space-y-6'>
                <div className='border-b pb-4'>
                  <h3 className='text-xl font-semibold text-gray-900'>
                    Program Selection
                  </h3>
                  <p className='text-sm text-gray-600 mt-1'>
                    Choose your preferred track and cohort
                  </p>
                </div>

                <div className='grid grid-cols-1 md:grid-cols-2 gap-6'>
                  <div className='space-y-2'>
                    <Label htmlFor='trackId'>Preferred Track *</Label>
                    <Select
                      onValueChange={(value) =>
                        handleSelectChange('trackId', value)
                      }
                    >
                      <SelectTrigger>
                        <SelectValue placeholder='Select a track' />
                      </SelectTrigger>
                      <SelectContent>
                        {tracks.map((track) => (
                          <SelectItem key={track._id} value={track.trackId}>
                            {track.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    {formData.trackId && (
                      <p className='text-xs text-gray-600'>
                        {
                          tracks.find((t) => t.trackId === formData.trackId)
                            ?.description
                        }
                      </p>
                    )}
                  </div>

                  <div className='space-y-2'>
                    <Label htmlFor='cohortNumber'>Preferred Cohort *</Label>
                    <Select
                      onValueChange={(value) =>
                        handleSelectChange('cohortNumber', value)
                      }
                    >
                      <SelectTrigger>
                        <SelectValue placeholder='Select a cohort' />
                      </SelectTrigger>
                      <SelectContent>
                        {cohorts
                          .filter((cohort) => cohort.isAcceptingApplications)
                          .map((cohort) => (
                            <SelectItem
                              key={cohort._id}
                              value={cohort.cohortNumber}
                            >
                              {cohort.name}
                            </SelectItem>
                          ))}
                      </SelectContent>
                    </Select>
                    {formData.cohortNumber && (
                      <p className='text-xs text-gray-600'>
                        {
                          cohorts.find(
                            (c) => c.cohortNumber === formData.cohortNumber
                          )?.description
                        }
                      </p>
                    )}
                  </div>
                </div>
              </div>

              {/* Additional Information */}
              <div className='space-y-6'>
                <div className='border-b pb-4'>
                  <h3 className='text-xl font-semibold text-gray-900'>
                    Additional Information
                  </h3>
                  <p className='text-sm text-gray-600 mt-1'>
                    Tell us more about yourself and upload your CV
                  </p>
                </div>

                <div className='space-y-4'>
                  <div className='space-y-2'>
                    <Label htmlFor='motivation'>
                      Why do you want to join Uptick Talent? *
                    </Label>
                    <Textarea
                      id='motivation'
                      name='motivation'
                      value={formData.motivation}
                      onChange={handleInputChange}
                      placeholder='Tell us about your motivation, career goals, and what you hope to achieve...'
                      rows={4}
                      required
                      maxLength={1000}
                    />
                    <p className='text-xs text-gray-500'>
                      {formData.motivation.length}/1000 characters
                    </p>
                  </div>

                  <div className='space-y-2'>
                    <Label htmlFor='referralSource'>
                      How did you hear about us?
                    </Label>
                    <Input
                      id='referralSource'
                      name='referralSource'
                      type='text'
                      value={formData.referralSource}
                      onChange={handleInputChange}
                      placeholder='e.g., LinkedIn, Twitter, Friend referral, etc.'
                      maxLength={500}
                    />
                  </div>

                  <div className='space-y-2'>
                    <Label htmlFor='cv'>Upload CV/Resume *</Label>
                    <Input
                      id='cv'
                      type='file'
                      onChange={handleFileChange}
                      accept='.pdf,.doc,.docx'
                      required
                      className='file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100'
                    />
                    {cvFile && (
                      <p className='text-sm text-green-600'>
                        Selected: {cvFile.name} (
                        {(cvFile.size / 1024 / 1024).toFixed(2)} MB)
                      </p>
                    )}
                    <p className='text-xs text-gray-500'>
                      Supported formats: PDF, Word documents. Max size: 5MB
                    </p>
                  </div>
                </div>
              </div>

              {/* Submit Button */}
              <div className='pt-6'>
                <Button
                  type='submit'
                  className='w-full py-3 text-lg'
                  disabled={loading}
                  size='lg'
                >
                  {loading ? (
                    <>
                      <div className='animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2'></div>
                      Submitting Application...
                    </>
                  ) : (
                    'Submit Application'
                  )}
                </Button>
                <p className='text-xs text-gray-500 text-center mt-2'>
                  By submitting this application, you agree to our terms and
                  conditions
                </p>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
