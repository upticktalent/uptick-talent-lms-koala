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
import { Badge } from '@/components/ui/badge';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { applicationService } from '@/services/applicationService';
import { ICohort, ITrack, ApplicationForm, ApiResponse } from '@/types';
import { toast } from 'sonner';
import {
  ChevronLeft,
  ChevronRight,
  Calendar,
  Clock,
  Users,
  CheckCircle,
  XCircle,
  AlertTriangle,
  FileText,
  Target,
  Code,
  Upload,
  Loader2,
} from 'lucide-react';

interface TrackWithDetails extends ITrack {
  availableSlots?: number;
}

export default function ApplicationPage() {
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState(1);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [currentCohort, setCurrentCohort] = useState<ICohort | null>(null);
  const [availableTracks, setAvailableTracks] = useState<TrackWithDetails[]>(
    []
  );

  const [formData, setFormData] = useState<ApplicationForm>({
    firstName: '',
    lastName: '',
    email: '',
    phoneNumber: '',
    gender: 'male',
    country: '',
    state: '',
    educationalBackground: '',
    yearsOfExperience: '',
    tools: [],
    githubLink: '',
    portfolioLink: '',
    careerGoals: '',
    weeklyCommitment: '',
    referralSource: '',
    referralSourceOther: '',
    track: '',
  });

  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const toolOptions = [
    'HTML/CSS',
    'JavaScript',
    'React',
    'Vue.js',
    'Angular',
    'Node.js',
    'Express.js',
    'Python',
    'Django',
    'Flask',
    'Java',
    'Spring Boot',
    'C#',
    '.NET',
    'PHP',
    'Laravel',
    'Ruby',
    'Ruby on Rails',
    'Go',
    'Rust',
    'MySQL',
    'PostgreSQL',
    'MongoDB',
    'Redis',
    'Docker',
    'Kubernetes',
    'AWS',
    'Azure',
    'Google Cloud',
    'Git',
    'GitHub',
    'GitLab',
    'Figma',
    'Adobe XD',
    'Sketch',
    'Photoshop',
    'Illustrator',
    'Flutter',
    'React Native',
    'Swift',
    'Kotlin',
    'Xamarin',
  ];

  const referralSources = [
    'Social Media',
    'Google Search',
    'Friend/Colleague',
    'University/School',
    'Tech Community',
    'Job Board',
    'Blog/Article',
    'Podcast',
    'YouTube',
    'Other',
  ];

  const countries = [
    'Nigeria',
    'Ghana',
    'Kenya',
    'South Africa',
    'United States',
    'United Kingdom',
    'Canada',
    'Germany',
    'France',
    'Australia',
  ];

  const nigerianStates = [
    'Lagos',
    'Abuja',
    'Kano',
    'Rivers',
    'Oyo',
    'Delta',
    'Edo',
    'Ogun',
    'Kaduna',
    'Imo',
    'Enugu',
    'Abia',
    'Anambra',
  ];

  useEffect(() => {
    fetchApplicationData();
  }, []);

  const fetchApplicationData = async () => {
    try {
      setLoading(true);

      // Get current active cohort
      const cohortResponse: ApiResponse<ICohort> =
        await applicationService.getCurrentActiveCohort();
      if (cohortResponse.success && cohortResponse.data) {
        setCurrentCohort(cohortResponse.data);

        // Get available tracks for the cohort
        const tracksResponse: ApiResponse<ITrack[]> =
          await applicationService.getAvailableTracks();
        if (tracksResponse.success) {
          setAvailableTracks(tracksResponse.data || []);
        }
      } else {
        toast.error('No active cohort found for applications');
      }
    } catch (error) {
      console.error('Error fetching application data:', error);
      toast.error('Error loading application form');
    } finally {
      setLoading(false);
    }
  };

  const validateStep = (step: number): boolean => {
    const newErrors: Record<string, string> = {};

    switch (step) {
      case 1:
        if (!formData.firstName.trim())
          newErrors.firstName = 'First name is required';
        if (!formData.lastName.trim())
          newErrors.lastName = 'Last name is required';
        if (!formData.email.trim()) newErrors.email = 'Email is required';
        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
          newErrors.email = 'Please enter a valid email address';
        }
        if (!formData.phoneNumber.trim())
          newErrors.phoneNumber = 'Phone number is required';
        if (!formData.gender) newErrors.gender = 'Gender is required';
        break;

      case 2:
        if (!formData.country.trim()) newErrors.country = 'Country is required';
        if (!formData.state.trim()) newErrors.state = 'State is required';
        if (!formData.educationalBackground.trim()) {
          newErrors.educationalBackground =
            'Educational background is required';
        }
        if (!formData.yearsOfExperience.trim()) {
          newErrors.yearsOfExperience = 'Years of experience is required';
        }
        break;

      case 3:
        if (!formData.track) newErrors.track = 'Please select a track';
        if (formData.tools.length === 0) {
          newErrors.tools = 'Please select at least one tool/technology';
        }
        break;

      case 4:
        if (!formData.careerGoals.trim())
          newErrors.careerGoals = 'Career goals are required';
        if (!formData.weeklyCommitment.trim()) {
          newErrors.weeklyCommitment = 'Weekly commitment is required';
        }
        if (!formData.referralSource.trim()) {
          newErrors.referralSource = 'Referral source is required';
        }
        if (
          formData.referralSource === 'Other' &&
          !formData.referralSourceOther?.trim()
        ) {
          newErrors.referralSourceOther = 'Please specify other source';
        }
        if (!selectedFile) newErrors.cv = 'CV/Resume is required';
        break;
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleNext = () => {
    if (validateStep(currentStep)) {
      setCurrentStep((prev) => Math.min(prev + 1, 4));
    }
  };

  const handlePrevious = () => {
    setCurrentStep((prev) => Math.max(prev - 1, 1));
  };

  const handleToolToggle = (tool: string) => {
    setFormData((prev) => ({
      ...prev,
      tools: prev.tools.includes(tool)
        ? prev.tools.filter((t) => t !== tool)
        : [...prev.tools, tool],
    }));
  };

  const handleSubmit = async () => {
    if (!validateStep(4)) return;

    setSubmitting(true);

    try {
      const submitFormData = new FormData();

      // Add all form fields
      Object.entries(formData).forEach(([key, value]) => {
        if (key === 'tools') {
          submitFormData.append(key, JSON.stringify(value));
        } else if (value) {
          submitFormData.append(key, value.toString());
        }
      });

      // Add CV file
      if (selectedFile) {
        submitFormData.append('cv', selectedFile);
      }

      const response: ApiResponse<any> =
        await applicationService.submitApplication(submitFormData);

      if (response.success) {
        toast.success('Application submitted successfully!');
        router.push('/apply/success');
      } else {
        toast.error(response.message || 'Failed to submit application');
      }
    } catch (error: any) {
      console.error('Application submission error:', error);
      toast.error(
        error.response?.data?.message || 'Error submitting application'
      );
    } finally {
      setSubmitting(false);
    }
  };

  const getSelectedTrack = () => {
    return availableTracks.find((track) => track._id === formData.track);
  };

  if (loading) {
    return (
      <div className='min-h-screen flex items-center justify-center'>
        <div className='text-center'>
          <Loader2 className='h-8 w-8 animate-spin mx-auto mb-4' />
          <p>Loading application form...</p>
        </div>
      </div>
    );
  }

  if (!currentCohort) {
    return (
      <div className='min-h-screen flex items-center justify-center'>
        <Card className='max-w-md'>
          <CardHeader>
            <CardTitle className='flex items-center gap-2'>
              <XCircle className='h-5 w-5 text-red-500' />
              Applications Closed
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className='text-muted-foreground'>
              There are currently no active cohorts accepting applications.
              Please check back later.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  const isApplicationDeadlinePassed =
    new Date() > new Date(currentCohort.applicationDeadline);

  if (isApplicationDeadlinePassed) {
    return (
      <div className='min-h-screen flex items-center justify-center'>
        <Card className='max-w-md'>
          <CardHeader>
            <CardTitle className='flex items-center gap-2'>
              <AlertTriangle className='h-5 w-5 text-yellow-500' />
              Application Deadline Passed
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className='text-muted-foreground'>
              The application deadline for {currentCohort.name} has passed.
              Applications are no longer being accepted.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className='min-h-screen bg-gray-50 py-12'>
      <div className='max-w-4xl mx-auto px-4'>
        {/* Header */}
        <div className='text-center mb-8'>
          <h1 className='text-3xl font-bold text-gray-900 mb-2'>
            Apply to {currentCohort.name}
          </h1>
          <p className='text-gray-600'>
            Join our comprehensive software development program
          </p>

          {/* Cohort Info */}
          <div className='mt-6 flex justify-center'>
            <Card className='max-w-2xl'>
              <CardContent className='p-6'>
                <div className='grid grid-cols-1 md:grid-cols-3 gap-4 text-center'>
                  <div className='flex items-center justify-center gap-2'>
                    <Calendar className='h-5 w-5 text-blue-500' />
                    <div>
                      <p className='text-sm text-gray-600'>Program Duration</p>
                      <p className='font-medium'>
                        {new Date(currentCohort.startDate).toLocaleDateString()}{' '}
                        - {new Date(currentCohort.endDate).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                  <div className='flex items-center justify-center gap-2'>
                    <Clock className='h-5 w-5 text-green-500' />
                    <div>
                      <p className='text-sm text-gray-600'>
                        Application Deadline
                      </p>
                      <p className='font-medium'>
                        {new Date(
                          currentCohort.applicationDeadline
                        ).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                  <div className='flex items-center justify-center gap-2'>
                    <Users className='h-5 w-5 text-purple-500' />
                    <div>
                      <p className='text-sm text-gray-600'>Available Spots</p>
                      <p className='font-medium'>
                        {currentCohort.maxStudents -
                          currentCohort.currentStudents}{' '}
                        remaining
                      </p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Progress Steps */}
        <div className='mb-8'>
          <div className='flex items-center justify-center space-x-4'>
            {[1, 2, 3, 4].map((step) => (
              <div key={step} className='flex items-center'>
                <div
                  className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                    currentStep >= step
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-200 text-gray-600'
                  }`}
                >
                  {currentStep > step ? (
                    <CheckCircle className='h-5 w-5' />
                  ) : (
                    step
                  )}
                </div>
                {step < 4 && (
                  <div
                    className={`w-16 h-1 mx-2 ${
                      currentStep > step ? 'bg-blue-600' : 'bg-gray-200'
                    }`}
                  />
                )}
              </div>
            ))}
          </div>
          <div className='flex justify-center mt-2'>
            <p className='text-sm text-gray-600'>
              Step {currentStep} of 4:{' '}
              {currentStep === 1
                ? 'Personal Information'
                : currentStep === 2
                ? 'Background & Experience'
                : currentStep === 3
                ? 'Track & Skills'
                : 'Goals & Motivation'}
            </p>
          </div>
        </div>

        {/* Form Content */}
        <Card className='max-w-2xl mx-auto'>
          <CardContent className='p-8'>
            {currentStep === 1 && (
              <div className='space-y-6'>
                <div className='text-center mb-6'>
                  <h2 className='text-xl font-semibold'>
                    Personal Information
                  </h2>
                  <p className='text-gray-600'>Tell us about yourself</p>
                </div>

                <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
                  <div>
                    <Label htmlFor='firstName'>First Name *</Label>
                    <Input
                      id='firstName'
                      value={formData.firstName}
                      onChange={(e) =>
                        setFormData((prev) => ({
                          ...prev,
                          firstName: e.target.value,
                        }))
                      }
                      placeholder='John'
                      className={errors.firstName ? 'border-red-500' : ''}
                    />
                    {errors.firstName && (
                      <p className='text-red-500 text-sm mt-1'>
                        {errors.firstName}
                      </p>
                    )}
                  </div>

                  <div>
                    <Label htmlFor='lastName'>Last Name *</Label>
                    <Input
                      id='lastName'
                      value={formData.lastName}
                      onChange={(e) =>
                        setFormData((prev) => ({
                          ...prev,
                          lastName: e.target.value,
                        }))
                      }
                      placeholder='Doe'
                      className={errors.lastName ? 'border-red-500' : ''}
                    />
                    {errors.lastName && (
                      <p className='text-red-500 text-sm mt-1'>
                        {errors.lastName}
                      </p>
                    )}
                  </div>
                </div>

                <div>
                  <Label htmlFor='email'>Email Address *</Label>
                  <Input
                    id='email'
                    type='email'
                    value={formData.email}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        email: e.target.value,
                      }))
                    }
                    placeholder='john@example.com'
                    className={errors.email ? 'border-red-500' : ''}
                  />
                  {errors.email && (
                    <p className='text-red-500 text-sm mt-1'>{errors.email}</p>
                  )}
                </div>

                <div>
                  <Label htmlFor='phoneNumber'>Phone Number *</Label>
                  <Input
                    id='phoneNumber'
                    value={formData.phoneNumber}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        phoneNumber: e.target.value,
                      }))
                    }
                    placeholder='+234 801 234 5678'
                    className={errors.phoneNumber ? 'border-red-500' : ''}
                  />
                  {errors.phoneNumber && (
                    <p className='text-red-500 text-sm mt-1'>
                      {errors.phoneNumber}
                    </p>
                  )}
                </div>

                <div>
                  <Label htmlFor='gender'>Gender *</Label>
                  <Select
                    value={formData.gender}
                    onValueChange={(value: 'male' | 'female') =>
                      setFormData((prev) => ({ ...prev, gender: value }))
                    }
                  >
                    <SelectTrigger
                      className={errors.gender ? 'border-red-500' : ''}
                    >
                      <SelectValue placeholder='Select gender' />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value='male'>Male</SelectItem>
                      <SelectItem value='female'>Female</SelectItem>
                    </SelectContent>
                  </Select>
                  {errors.gender && (
                    <p className='text-red-500 text-sm mt-1'>{errors.gender}</p>
                  )}
                </div>
              </div>
            )}

            {currentStep === 2 && (
              <div className='space-y-6'>
                <div className='text-center mb-6'>
                  <h2 className='text-xl font-semibold'>
                    Background & Experience
                  </h2>
                  <p className='text-gray-600'>
                    Share your educational and professional background
                  </p>
                </div>

                <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
                  <div>
                    <Label htmlFor='country'>Country *</Label>
                    <Select
                      value={formData.country}
                      onValueChange={(value) =>
                        setFormData((prev) => ({
                          ...prev,
                          country: value,
                          state: '',
                        }))
                      }
                    >
                      <SelectTrigger
                        className={errors.country ? 'border-red-500' : ''}
                      >
                        <SelectValue placeholder='Select country' />
                      </SelectTrigger>
                      <SelectContent>
                        {countries.map((country) => (
                          <SelectItem key={country} value={country}>
                            {country}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    {errors.country && (
                      <p className='text-red-500 text-sm mt-1'>
                        {errors.country}
                      </p>
                    )}
                  </div>

                  <div>
                    <Label htmlFor='state'>State/Province *</Label>
                    <Select
                      value={formData.state}
                      onValueChange={(value) =>
                        setFormData((prev) => ({ ...prev, state: value }))
                      }
                      disabled={!formData.country}
                    >
                      <SelectTrigger
                        className={errors.state ? 'border-red-500' : ''}
                      >
                        <SelectValue placeholder='Select state' />
                      </SelectTrigger>
                      <SelectContent>
                        {(formData.country === 'Nigeria'
                          ? nigerianStates
                          : ['Other']
                        ).map((state) => (
                          <SelectItem key={state} value={state}>
                            {state}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    {errors.state && (
                      <p className='text-red-500 text-sm mt-1'>
                        {errors.state}
                      </p>
                    )}
                  </div>
                </div>

                <div>
                  <Label htmlFor='educationalBackground'>
                    Educational Background *
                  </Label>
                  <Textarea
                    id='educationalBackground'
                    value={formData.educationalBackground}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        educationalBackground: e.target.value,
                      }))
                    }
                    placeholder="e.g., Bachelor's degree in Computer Science from University of Lagos"
                    className={
                      errors.educationalBackground ? 'border-red-500' : ''
                    }
                    rows={3}
                  />
                  {errors.educationalBackground && (
                    <p className='text-red-500 text-sm mt-1'>
                      {errors.educationalBackground}
                    </p>
                  )}
                </div>

                <div>
                  <Label htmlFor='yearsOfExperience'>
                    Years of Professional Experience *
                  </Label>
                  <Select
                    value={formData.yearsOfExperience}
                    onValueChange={(value) =>
                      setFormData((prev) => ({
                        ...prev,
                        yearsOfExperience: value,
                      }))
                    }
                  >
                    <SelectTrigger
                      className={
                        errors.yearsOfExperience ? 'border-red-500' : ''
                      }
                    >
                      <SelectValue placeholder='Select experience level' />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value='0'>
                        No professional experience
                      </SelectItem>
                      <SelectItem value='1'>Less than 1 year</SelectItem>
                      <SelectItem value='1-2'>1-2 years</SelectItem>
                      <SelectItem value='3-5'>3-5 years</SelectItem>
                      <SelectItem value='5+'>5+ years</SelectItem>
                    </SelectContent>
                  </Select>
                  {errors.yearsOfExperience && (
                    <p className='text-red-500 text-sm mt-1'>
                      {errors.yearsOfExperience}
                    </p>
                  )}
                </div>

                <div>
                  <Label htmlFor='githubLink'>GitHub Profile (Optional)</Label>
                  <Input
                    id='githubLink'
                    value={formData.githubLink}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        githubLink: e.target.value,
                      }))
                    }
                    placeholder='https://github.com/yourusername'
                  />
                </div>

                <div>
                  <Label htmlFor='portfolioLink'>
                    Portfolio Website (Optional)
                  </Label>
                  <Input
                    id='portfolioLink'
                    value={formData.portfolioLink}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        portfolioLink: e.target.value,
                      }))
                    }
                    placeholder='https://yourportfolio.com'
                  />
                </div>
              </div>
            )}

            {currentStep === 3 && (
              <div className='space-y-6'>
                <div className='text-center mb-6'>
                  <h2 className='text-xl font-semibold'>Track & Skills</h2>
                  <p className='text-gray-600'>
                    Choose your specialization and current skills
                  </p>
                </div>

                <div>
                  <Label htmlFor='track'>Select Track *</Label>
                  <div className='grid grid-cols-1 gap-4 mt-3'>
                    {availableTracks.map((track) => (
                      <Card
                        key={track._id}
                        className={`cursor-pointer transition-all ${
                          formData.track === track._id
                            ? 'border-blue-500 bg-blue-50'
                            : 'hover:border-gray-300'
                        }`}
                        onClick={() =>
                          setFormData((prev) => ({ ...prev, track: track._id }))
                        }
                      >
                        <CardContent className='p-4'>
                          <div className='flex items-center justify-between'>
                            <div className='flex items-center gap-3'>
                              <div
                                className='w-4 h-4 rounded-full border-2 flex items-center justify-center'
                                style={{
                                  borderColor:
                                    formData.track === track._id
                                      ? '#3b82f6'
                                      : '#d1d5db',
                                  backgroundColor:
                                    formData.track === track._id
                                      ? '#3b82f6'
                                      : 'transparent',
                                }}
                              >
                                {formData.track === track._id && (
                                  <div className='w-2 h-2 bg-white rounded-full' />
                                )}
                              </div>
                              <div>
                                <h3 className='font-medium'>{track.name}</h3>
                                <p className='text-sm text-gray-600'>
                                  {track.description}
                                </p>
                              </div>
                            </div>
                            <Badge
                              variant='outline'
                              style={{ backgroundColor: track.color }}
                            >
                              {track.slug}
                            </Badge>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                  {errors.track && (
                    <p className='text-red-500 text-sm mt-1'>{errors.track}</p>
                  )}
                </div>

                <div>
                  <Label>Technical Skills & Tools *</Label>
                  <p className='text-sm text-gray-600 mb-3'>
                    Select all tools and technologies you have experience with:
                  </p>
                  <div className='grid grid-cols-2 md:grid-cols-3 gap-2 max-h-64 overflow-y-auto border rounded-lg p-4'>
                    {toolOptions.map((tool) => (
                      <div key={tool} className='flex items-center space-x-2'>
                        <Checkbox
                          id={tool}
                          checked={formData.tools.includes(tool)}
                          onCheckedChange={() => handleToolToggle(tool)}
                        />
                        <Label htmlFor={tool} className='text-sm'>
                          {tool}
                        </Label>
                      </div>
                    ))}
                  </div>
                  {errors.tools && (
                    <p className='text-red-500 text-sm mt-1'>{errors.tools}</p>
                  )}
                  <p className='text-sm text-gray-500 mt-2'>
                    Selected: {formData.tools.length} tools
                  </p>
                </div>
              </div>
            )}

            {currentStep === 4 && (
              <div className='space-y-6'>
                <div className='text-center mb-6'>
                  <h2 className='text-xl font-semibold'>Goals & Motivation</h2>
                  <p className='text-gray-600'>
                    Tell us about your aspirations and commitment
                  </p>
                </div>

                <div>
                  <Label htmlFor='careerGoals'>Career Goals *</Label>
                  <Textarea
                    id='careerGoals'
                    value={formData.careerGoals}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        careerGoals: e.target.value,
                      }))
                    }
                    placeholder='Describe your career goals and how this program will help you achieve them...'
                    className={errors.careerGoals ? 'border-red-500' : ''}
                    rows={4}
                  />
                  {errors.careerGoals && (
                    <p className='text-red-500 text-sm mt-1'>
                      {errors.careerGoals}
                    </p>
                  )}
                </div>

                <div>
                  <Label htmlFor='weeklyCommitment'>
                    Weekly Time Commitment *
                  </Label>
                  <Select
                    value={formData.weeklyCommitment}
                    onValueChange={(value) =>
                      setFormData((prev) => ({
                        ...prev,
                        weeklyCommitment: value,
                      }))
                    }
                  >
                    <SelectTrigger
                      className={
                        errors.weeklyCommitment ? 'border-red-500' : ''
                      }
                    >
                      <SelectValue placeholder='How many hours per week can you commit?' />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value='10-15'>
                        10-15 hours per week
                      </SelectItem>
                      <SelectItem value='15-20'>
                        15-20 hours per week
                      </SelectItem>
                      <SelectItem value='20-25'>
                        20-25 hours per week
                      </SelectItem>
                      <SelectItem value='25+'>25+ hours per week</SelectItem>
                    </SelectContent>
                  </Select>
                  {errors.weeklyCommitment && (
                    <p className='text-red-500 text-sm mt-1'>
                      {errors.weeklyCommitment}
                    </p>
                  )}
                </div>

                <div>
                  <Label htmlFor='referralSource'>
                    How did you hear about us? *
                  </Label>
                  <Select
                    value={formData.referralSource}
                    onValueChange={(value) =>
                      setFormData((prev) => ({
                        ...prev,
                        referralSource: value,
                      }))
                    }
                  >
                    <SelectTrigger
                      className={errors.referralSource ? 'border-red-500' : ''}
                    >
                      <SelectValue placeholder='Select referral source' />
                    </SelectTrigger>
                    <SelectContent>
                      {referralSources.map((source) => (
                        <SelectItem key={source} value={source}>
                          {source}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {errors.referralSource && (
                    <p className='text-red-500 text-sm mt-1'>
                      {errors.referralSource}
                    </p>
                  )}
                </div>

                {formData.referralSource === 'Other' && (
                  <div>
                    <Label htmlFor='referralSourceOther'>
                      Please specify *
                    </Label>
                    <Input
                      id='referralSourceOther'
                      value={formData.referralSourceOther}
                      onChange={(e) =>
                        setFormData((prev) => ({
                          ...prev,
                          referralSourceOther: e.target.value,
                        }))
                      }
                      placeholder='Please specify how you heard about us'
                      className={
                        errors.referralSourceOther ? 'border-red-500' : ''
                      }
                    />
                    {errors.referralSourceOther && (
                      <p className='text-red-500 text-sm mt-1'>
                        {errors.referralSourceOther}
                      </p>
                    )}
                  </div>
                )}

                <div>
                  <Label htmlFor='cv'>Upload CV/Resume *</Label>
                  <div className='mt-2'>
                    <Input
                      id='cv'
                      type='file'
                      accept='.pdf,.doc,.docx'
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) {
                          if (file.size > 5 * 1024 * 1024) {
                            // 5MB limit
                            toast.error('File size must be less than 5MB');
                            return;
                          }
                          setSelectedFile(file);
                        }
                      }}
                      className={errors.cv ? 'border-red-500' : ''}
                    />
                    {errors.cv && (
                      <p className='text-red-500 text-sm mt-1'>{errors.cv}</p>
                    )}
                    <p className='text-sm text-gray-500 mt-1'>
                      Accepted formats: PDF, DOC, DOCX (Max size: 5MB)
                    </p>
                    {selectedFile && (
                      <p className='text-sm text-green-600 mt-1'>
                        ✓ {selectedFile.name} selected
                      </p>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* Navigation Buttons */}
            <div className='flex justify-between pt-6 border-t'>
              <Button
                variant='outline'
                onClick={handlePrevious}
                disabled={currentStep === 1}
                className='flex items-center gap-2'
              >
                <ChevronLeft className='h-4 w-4' />
                Previous
              </Button>

              {currentStep < 4 ? (
                <Button
                  onClick={handleNext}
                  className='flex items-center gap-2'
                >
                  Next
                  <ChevronRight className='h-4 w-4' />
                </Button>
              ) : (
                <Button
                  onClick={handleSubmit}
                  disabled={submitting}
                  className='flex items-center gap-2'
                >
                  {submitting ? (
                    <>
                      <Loader2 className='h-4 w-4 animate-spin' />
                      Submitting...
                    </>
                  ) : (
                    <>
                      <Upload className='h-4 w-4' />
                      Submit Application
                    </>
                  )}
                </Button>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Selected Track Summary */}
        {currentStep === 4 && getSelectedTrack() && (
          <Card className='max-w-2xl mx-auto mt-6'>
            <CardHeader>
              <CardTitle className='flex items-center gap-2'>
                <Target className='h-5 w-5' />
                Application Summary
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className='space-y-4'>
                <div>
                  <h4 className='font-medium text-gray-900'>Selected Track</h4>
                  <div className='flex items-center gap-2 mt-1'>
                    <Badge
                      style={{ backgroundColor: getSelectedTrack()?.color }}
                    >
                      {getSelectedTrack()?.name}
                    </Badge>
                  </div>
                </div>
                <div>
                  <h4 className='font-medium text-gray-900'>
                    Technical Skills
                  </h4>
                  <div className='flex flex-wrap gap-1 mt-1'>
                    {formData.tools.slice(0, 10).map((tool) => (
                      <Badge key={tool} variant='outline' className='text-xs'>
                        {tool}
                      </Badge>
                    ))}
                    {formData.tools.length > 10 && (
                      <Badge variant='outline' className='text-xs'>
                        +{formData.tools.length - 10} more
                      </Badge>
                    )}
                  </div>
                </div>
                <div>
                  <h4 className='font-medium text-gray-900'>Time Commitment</h4>
                  <p className='text-sm text-gray-600'>
                    {formData.weeklyCommitment}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
