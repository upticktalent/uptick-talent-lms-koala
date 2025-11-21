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
import { applicantService } from '@/services/applicantService';
import { handleApiError } from '@/utils/handleApiError';
import { toast } from 'sonner';
import { getToolsForTrack, getTrackInfo } from '@/utils/trackData';

// Import country and state data
import COUNTRIES_DATA from '../../files/countriesminified.json';
import STATES_DATA from '../../files/statesminified.json';

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
} from 'lucide-react';

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
  applicationDeadline: string;
  startDate: string;
  endDate: string;
}

type ApplicationStep =
  | 'about'
  | 'personal-info'
  | 'track-selection'
  | 'background'
  | 'final-review';

export default function ApplyPage() {
  // Current step state
  const [currentStep, setCurrentStep] = useState<ApplicationStep>('about');

  // Form state
  const [formData, setFormData] = useState({
    // Personal Information
    firstName: '',
    lastName: '',
    email: '',
    phoneNumber: '',
    gender: '',
    countryId: 161, // Default to Nigeria (ID 161)
    country: 'Nigeria', // Keep for backend compatibility
    stateId: 0, // Use number type to match country data structure
    state: '',
    educationalBackground: '',

    // Track Selection
    trackId: '',
    tools: [] as string[],

    // Background & Experience
    yearsOfExperience: '',
    githubLink: '',
    portfolioLink: '',
    careerGoals: '',
    weeklyCommitment: '',
    referralSource: '',
    referralSourceOther: '',

    // Backend compatibility
    cohortNumber: '',
  });

  const [cvFile, setCvFile] = useState<File | null>(null);
  const [selectedTrackTools, setSelectedTrackTools] = useState<string[]>([]);

  // Data states
  const [tracks, setTracks] = useState<Track[]>([]);
  const [cohorts, setCohorts] = useState<Cohort[]>([]);
  const [activeCohort, setActiveCohort] = useState<Cohort | null>(null);
  const [availableStates, setAvailableStates] = useState<any[]>([]);

  // UI states
  const [loading, setLoading] = useState(false);
  const [dataLoading, setDataLoading] = useState(true);
  const [error, setError] = useState('');
  const [validationErrors, setValidationErrors] = useState<
    Record<string, string>
  >({});

  // Utility functions for country/state data
  const getCountries = () => {
    return COUNTRIES_DATA;
  };

  const getStatesForCountry = (countryId: number) => {
    const countryData = STATES_DATA.find((item: any) => item.id === countryId);
    return countryData ? countryData.states : [];
  };

  const getCountryById = (countryId: number) => {
    return COUNTRIES_DATA.find((country: any) => country.id === countryId);
  };

  const getStateById = (countryId: number, stateId: number) => {
    const states = getStatesForCountry(countryId);
    return states.find((state: any) => state.id === stateId);
  };

  const router = useRouter();

  useEffect(() => {
    loadInitialData();
  }, []);

  // Load states when country changes
  useEffect(() => {
    if (formData.countryId) {
      const states = getStatesForCountry(formData.countryId);
      setAvailableStates(states);

      // Clear selected state when country changes
      if (formData.stateId && states.length > 0) {
        const stateExists = states.find(
          (state: any) => state.id === formData.stateId
        );
        if (!stateExists) {
          setFormData((prev) => ({
            ...prev,
            stateId: 0,
            state: '',
          }));
        }
      }
    }
  }, [formData.countryId]);

  const loadInitialData = async () => {
    try {
      const [tracksResponse] = await Promise.all([
        applicantService.getTracks(),
      ]);

      setTracks(tracksResponse.data.data || []);

      // Get the current active cohort
      try {
        const cohortResponse = await applicantService.getCurrentActiveCohort();
        const currentCohort = cohortResponse.data.data;
        setActiveCohort(currentCohort);
        setCohorts([currentCohort]); // Set as array for compatibility
        setFormData((prev) => ({
          ...prev,
          cohortNumber: currentCohort.cohortNumber,
        }));
      } catch (cohortErr: any) {
        // No active cohort found
        if (cohortErr.response?.status === 404) {
          setActiveCohort(null);
          setCohorts([]);
        } else {
          throw cohortErr;
        }
      }

      // Load initial states for Nigeria (default country)
      const initialStates = getStatesForCountry(161); // Nigeria ID is 161
      setAvailableStates(initialStates);
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

  const handleCountryChange = (countryId: string) => {
    const country = getCountryById(parseInt(countryId));
    setFormData((prev) => ({
      ...prev,
      countryId: parseInt(countryId),
      country: country ? country.name : '',
      stateId: 0, // Clear state when country changes
      state: '',
    }));
  };

  const handleStateChange = (stateId: string) => {
    const state = getStateById(formData.countryId, parseInt(stateId));
    setFormData((prev) => ({
      ...prev,
      stateId: parseInt(stateId),
      state: state ? state.name : '',
    }));
  };

  const handleTrackSelection = (trackId: string) => {
    setFormData((prev) => ({ ...prev, trackId }));

    // Load suggested tools for the selected track
    const suggestedTools = getToolsForTrack(trackId);
    setSelectedTrackTools(suggestedTools);

    // Clear current tools when switching tracks
    setFormData((prev) => ({ ...prev, tools: [] }));
  };

  const addTool = (tool: string) => {
    if (!formData.tools.includes(tool)) {
      setFormData((prev) => ({
        ...prev,
        tools: [...prev.tools, tool],
      }));
    }
  };

  const removeTool = (toolToRemove: string) => {
    setFormData((prev) => ({
      ...prev,
      tools: prev.tools.filter((tool) => tool !== toolToRemove),
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

  const handleSubmit = async () => {
    if (!cvFile) {
      toast.error('Please upload your CV');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const formDataToSend = new FormData();

      // Send the correct fields as expected by backend
      formDataToSend.append('firstName', formData.firstName);
      formDataToSend.append('lastName', formData.lastName);
      formDataToSend.append('email', formData.email);
      formDataToSend.append('phoneNumber', formData.phoneNumber);
      formDataToSend.append('gender', formData.gender);
      formDataToSend.append('country', formData.country);
      formDataToSend.append('state', formData.state);
      formDataToSend.append('trackId', formData.trackId);
      formDataToSend.append('cohortNumber', formData.cohortNumber);
      formDataToSend.append(
        'educationalBackground',
        formData.educationalBackground
      );

      // New application fields
      formDataToSend.append('yearsOfExperience', formData.yearsOfExperience);
      formDataToSend.append('githubLink', formData.githubLink || '');
      formDataToSend.append('portfolioLink', formData.portfolioLink || '');
      formDataToSend.append('careerGoals', formData.careerGoals);
      formDataToSend.append('weeklyCommitment', formData.weeklyCommitment);
      formDataToSend.append('referralSource', formData.referralSource);
      formDataToSend.append(
        'referralSourceOther',
        formData.referralSourceOther || ''
      );

      // Add selected tools
      formData.tools.forEach((tool) => formDataToSend.append('tools[]', tool));

      // Add CV file
      formDataToSend.append('cv', cvFile);

      const response = await applicantService.submitApplication(formDataToSend);
      const applicationId = response.data.data.applicationId;

      toast.success('Application submitted successfully!');
      router.push(`/apply/success?id=${applicationId}`);
    } catch (err: any) {
      // Clear previous validation errors
      setValidationErrors({});

      // Handle validation errors specifically
      if (err?.response?.status === 400 && err?.response?.data?.errors) {
        const errors = err.response.data.errors;
        const fieldErrors: Record<string, string> = {};

        // Map backend validation errors to field-specific errors
        errors.forEach((error: any) => {
          if (error.field && error.message) {
            fieldErrors[error.field] = error.message;
          }
        });

        setValidationErrors(fieldErrors);
        setError('Please correct the errors below and try again.');
        toast.error('Please correct the validation errors and try again.');
      } else {
        // Handle other types of errors
        const errorMessage = handleApiError(err);
        setError(errorMessage);
        toast.error(errorMessage);
      }
    } finally {
      setLoading(false);
    }
  };

  const validateCurrentStep = () => {
    const errors: Record<string, string> = {};

    switch (currentStep) {
      case 'about':
        // No validation needed for about step
        break;
      case 'personal-info':
        if (!formData.firstName.trim())
          errors.firstName = 'First name is required';
        if (!formData.lastName.trim())
          errors.lastName = 'Last name is required';
        if (!formData.email.trim()) {
          errors.email = 'Email is required';
        } else if (!validateEmail(formData.email)) {
          errors.email = 'Please enter a valid email address';
        }
        if (!formData.phoneNumber.trim()) {
          errors.phoneNumber = 'Phone number is required';
        } else if (!validatePhone(formData.phoneNumber)) {
          errors.phoneNumber = 'Please enter a valid phone number';
        }
        if (!formData.gender) errors.gender = 'Gender is required';
        if (!formData.countryId) errors.country = 'Country is required';
        if (!formData.stateId || formData.stateId === 0)
          errors.state = 'State is required';
        // Educational background is now optional
        break;

      case 'track-selection':
        if (!formData.trackId) errors.trackId = 'Please select a track';
        if (formData.tools.length === 0)
          errors.tools = 'Please select at least one tool or technology';
        break;

      case 'background':
        if (!formData.yearsOfExperience)
          errors.yearsOfExperience = 'Years of experience is required';
        if (!formData.careerGoals.trim())
          errors.careerGoals = 'Career goals are required';
        if (!formData.weeklyCommitment)
          errors.weeklyCommitment = 'Weekly commitment is required';
        if (!formData.referralSource)
          errors.referralSource = 'Please tell us how you heard about us';
        if (!formData.portfolioLink.trim()) {
          errors.portfolioLink = 'Portfolio/project link is required';
        } else if (!validateUrl(formData.portfolioLink)) {
          errors.portfolioLink = 'Please enter a valid URL';
        }

        // Programming tracks require GitHub link
        const programmingTracks = [
          'frontend-development',
          'backend-development',
          'fullstack-development',
          'mobile-development',
        ];
        if (programmingTracks.includes(formData.trackId)) {
          if (!formData.githubLink.trim()) {
            errors.githubLink =
              'GitHub profile link is required for programming tracks';
          } else if (!validateGitHubUrl(formData.githubLink)) {
            errors.githubLink = 'Please enter a valid GitHub profile URL';
          }
        }

        // Other referral source validation
        if (
          formData.referralSource === 'other' &&
          !formData.referralSourceOther.trim()
        ) {
          errors.referralSourceOther = 'Please specify how you heard about us';
        }

        if (!cvFile) {
          toast.error('Please upload your CV/Resume');
          return false;
        }
        break;
    }

    if (Object.keys(errors).length > 0) {
      setValidationErrors(errors);
      setError('Please correct the errors below and try again.');
      return false;
    }

    return true;
  };

  const nextStep = () => {
    // Validate current step before proceeding
    if (!validateCurrentStep()) {
      return;
    }

    const steps: ApplicationStep[] = [
      'about',
      'personal-info',
      'track-selection',
      'background',
      'final-review',
    ];
    const currentIndex = steps.indexOf(currentStep);
    if (currentIndex < steps.length - 1) {
      setCurrentStep(steps[currentIndex + 1]);
      // Clear validation errors when moving to next step
      setValidationErrors({});
      setError('');
    }
  };

  const prevStep = () => {
    const steps: ApplicationStep[] = [
      'about',
      'personal-info',
      'track-selection',
      'background',
      'final-review',
    ];
    const currentIndex = steps.indexOf(currentStep);
    if (currentIndex > 0) {
      setCurrentStep(steps[currentIndex - 1]);
      // Clear validation errors when moving to previous step
      setValidationErrors({});
      setError('');
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  const getFieldError = (fieldName: string) => {
    return validationErrors[fieldName];
  };

  const clearFieldError = (fieldName: string) => {
    if (validationErrors[fieldName]) {
      setValidationErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors[fieldName];
        return newErrors;
      });
    }
  };

  // Frontend validation functions
  const validateEmail = (email: string) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const validateUrl = (url: string) => {
    if (!url) return true; // Allow empty URLs for optional fields
    try {
      new URL(url);
      return true;
    } catch {
      return false;
    }
  };

  const validatePhone = (phone: string) => {
    // Allow various phone formats
    const phoneRegex = /^[\+]?[\d\-\(\)\s]{10,}$/;
    return phoneRegex.test(phone.replace(/\s/g, ''));
  };

  const validateGitHubUrl = (url: string) => {
    if (!url) return true;
    const githubRegex = /^https?:\/\/(www\.)?github\.com\/[a-zA-Z0-9_-]+\/?$/;
    return githubRegex.test(url);
  };

  // Real-time validation
  const validateField = (name: string, value: string) => {
    let error = '';

    switch (name) {
      case 'email':
        if (value && !validateEmail(value)) {
          error = 'Please enter a valid email address';
        }
        break;
      case 'phoneNumber':
        if (value && !validatePhone(value)) {
          error = 'Please enter a valid phone number';
        }
        break;
      case 'githubLink':
        if (value && !validateGitHubUrl(value)) {
          error =
            'Please enter a valid GitHub profile URL (e.g., https://github.com/username)';
        }
        break;
      case 'portfolioLink':
        if (value && !validateUrl(value)) {
          error = 'Please enter a valid URL';
        }
        break;
      case 'firstName':
      case 'lastName':
        if (value && value.length > 50) {
          error = 'Name cannot exceed 50 characters';
        }
        break;
      case 'careerGoals':
        if (value && value.length > 500) {
          error = 'Career goals cannot exceed 500 characters';
        }
        break;
      case 'educationalBackground':
        if (value && value.length > 200) {
          error = 'Educational background cannot exceed 200 characters';
        }
        break;
      case 'referralSourceOther':
        if (value && value.length > 200) {
          error = 'This field cannot exceed 200 characters';
        }
        break;
    }

    return error;
  };

  const handleInputChangeWithValidation = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;

    // Update form data
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));

    // Clear previous field error
    clearFieldError(name);

    // Validate field and set error if invalid
    const fieldError = validateField(name, value);
    if (fieldError) {
      setValidationErrors((prev) => ({
        ...prev,
        [name]: fieldError,
      }));
    }
  };

  const handleSelectChangeWithValidation = (name: string, value: string) => {
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
    // Clear field-specific error when user makes selection
    clearFieldError(name);
  };

  const isStepValid = () => {
    switch (currentStep) {
      case 'about':
        return true; // About step is always valid
      case 'personal-info':
        return (
          formData.firstName &&
          formData.lastName &&
          formData.email &&
          formData.phoneNumber &&
          formData.gender &&
          formData.countryId &&
          formData.stateId &&
          formData.stateId !== 0
        );
      case 'track-selection':
        return formData.trackId !== '' && formData.tools.length > 0;
      case 'background':
        const baseValid =
          formData.yearsOfExperience &&
          formData.careerGoals &&
          formData.weeklyCommitment &&
          formData.referralSource &&
          formData.portfolioLink &&
          cvFile;

        // Check if "other" is selected and requires additional input
        const referralValid =
          formData.referralSource !== 'other' ||
          (formData.referralSource === 'other' && formData.referralSourceOther);

        // Programming tracks require GitHub link
        const programmingTracks = [
          'frontend-development',
          'backend-development',
          'fullstack-development',
          'mobile-development',
        ];
        if (programmingTracks.includes(formData.trackId)) {
          return baseValid && referralValid && formData.githubLink;
        }

        return baseValid && referralValid;
      case 'final-review':
        return true;
      default:
        return false;
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

  // Show no active cohort available message
  if (!activeCohort) {
    return (
      <div className='min-h-screen bg-gray-50 flex items-center justify-center p-4'>
        <Card className='w-full max-w-md text-center'>
          <CardHeader>
            <XCircle className='h-16 w-16 text-red-500 mx-auto mb-4' />
            <CardTitle className='text-2xl text-red-600'>
              Applications Closed
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className='text-gray-600 mb-6'>
              We're not currently accepting applications. The application
              deadline may have passed or there's no active cohort at the
              moment. Please check back later or follow our social media for
              updates on the next cohort.
            </p>
            <Button onClick={() => router.push('/')} variant='outline'>
              Return to Home
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className='min-h-screen bg-gray-50 p-4'>
      <div className='max-w-4xl mx-auto'>
        {/* Progress Bar */}
        <div className='mb-8'>
          <div className='flex items-center justify-between mb-4'>
            <h1 className='text-2xl font-bold text-gray-900'>
              Apply to Uptick Talent LMS
            </h1>
            <div className='text-sm text-gray-500'>
              Step{' '}
              {[
                'about',
                'personal-info',
                'track-selection',
                'background',
                'final-review',
              ].indexOf(currentStep) + 1}{' '}
              of 5
            </div>
          </div>
          <div className='w-full bg-gray-200 rounded-full h-2'>
            <div
              className='bg-blue-600 h-2 rounded-full transition-all duration-300'
              style={{
                width: `${
                  (([
                    'about',
                    'personal-info',
                    'track-selection',
                    'background',
                    'final-review',
                  ].indexOf(currentStep) +
                    1) /
                    5) *
                  100
                }%`,
              }}
            />
          </div>
        </div>

        {/* Step Content */}
        <Card>
          <CardContent className='p-8'>
            {error && (
              <Alert variant='destructive' className='mb-6'>
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            {/* Custom styles for red asterisks */}
            <style jsx>{`
              .required-asterisk {
                color: #ef4444;
              }
            `}</style>

            {/* About Step */}
            {currentStep === 'about' && (
              <div className='space-y-6'>
                <div className='text-center mb-8'>
                  <h2 className='text-3xl font-bold text-gray-900 mb-4'>
                    About Uptick Talent Fellowship
                  </h2>
                  <CardDescription className='text-lg'>
                    Learn about our program before you apply
                  </CardDescription>
                </div>

                <div className='prose prose-lg max-w-none text-gray-700'>
                  <p className='mb-6 text-lg leading-relaxed'>
                    Uptick Talent Fellowship is a structured and personalized
                    program designed to equip self-taught engineers, product
                    designers, and product managers with the skills, mentorship,
                    and hands-on experience needed to secure their first
                    entry-level role in the tech industry.
                  </p>

                  <p className='mb-6 leading-relaxed'>
                    Each program follows a 4.5-month structure—beginning with a
                    2-month intensive mentorship phase, where participants work
                    closely with industry experts, followed by a 2.5-month
                    capstone project designed to provide real-world experience
                    and build a strong portfolio.
                  </p>

                  <p className='mb-8 leading-relaxed'>
                    Our programs are tailored to assess your current skill
                    level, bridge knowledge gaps, and help you become a
                    job-ready, world-class professional.
                  </p>

                  <div className='bg-blue-50 border border-blue-200 rounded-lg p-6'>
                    <h3 className='text-xl font-semibold text-blue-900 mb-4 flex items-center'>
                      <Target className='h-6 w-6 mr-2' />
                      Who should apply?
                    </h3>
                    <ul className='space-y-2 text-blue-800'>
                      <li className='flex items-start'>
                        <CheckCircle className='h-5 w-5 text-blue-600 mr-2 mt-0.5 flex-shrink-0' />
                        Self-taught software engineers, product designers, and
                        product managers struggling to land their first role.
                      </li>
                      <li className='flex items-start'>
                        <CheckCircle className='h-5 w-5 text-blue-600 mr-2 mt-0.5 flex-shrink-0' />
                        Individuals with zero to little professional experience
                        looking for structured guidance and industry exposure.
                      </li>
                    </ul>
                  </div>
                </div>

                {/* Cohort Information */}
                {activeCohort && (
                  <div className='bg-blue-50 border border-blue-200 rounded-lg p-6 mt-8'>
                    <div className='flex items-center mb-4'>
                      <CheckCircle className='h-6 w-6 text-green-500 mr-2' />
                      <h3 className='text-lg font-semibold text-blue-900'>
                        {activeCohort.name} - Applications Open
                      </h3>
                    </div>
                    <p className='text-blue-800 mb-4'>
                      {activeCohort.description}
                    </p>
                    <div className='grid grid-cols-1 md:grid-cols-3 gap-4 text-sm'>
                      <div className='flex items-center text-blue-700'>
                        <Calendar className='h-4 w-4 mr-2' />
                        <span>
                          Deadline:{' '}
                          {formatDate(activeCohort.applicationDeadline)}
                        </span>
                      </div>
                      <div className='flex items-center text-blue-700'>
                        <Clock className='h-4 w-4 mr-2' />
                        <span>
                          Starts: {formatDate(activeCohort.startDate)}
                        </span>
                      </div>
                      <div className='flex items-center text-blue-700'>
                        <Users className='h-4 w-4 mr-2' />
                        <span>
                          Duration:{' '}
                          {Math.round(
                            (new Date(activeCohort.endDate).getTime() -
                              new Date(activeCohort.startDate).getTime()) /
                              (1000 * 60 * 60 * 24 * 30)
                          )}{' '}
                          months
                        </span>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Personal Information Step */}
            {currentStep === 'personal-info' && (
              <div className='space-y-6'>
                <div className='text-center mb-8'>
                  <CardTitle className='text-3xl mb-2'>
                    Personal Information
                  </CardTitle>
                  <CardDescription className='text-lg'>
                    Tell us about yourself
                  </CardDescription>
                </div>

                <div className='grid grid-cols-1 md:grid-cols-2 gap-6'>
                  <div className='space-y-2'>
                    <Label htmlFor='firstName'>
                      First Name <span className='required-asterisk'>*</span>
                    </Label>
                    <Input
                      id='firstName'
                      name='firstName'
                      value={formData.firstName}
                      onChange={handleInputChangeWithValidation}
                      required
                      maxLength={50}
                      className={
                        getFieldError('firstName')
                          ? 'border-red-500 focus:border-red-500'
                          : ''
                      }
                    />
                    {getFieldError('firstName') && (
                      <p className='text-sm text-red-600'>
                        {getFieldError('firstName')}
                      </p>
                    )}
                  </div>
                  <div className='space-y-2'>
                    <Label htmlFor='lastName'>
                      Last Name <span className='required-asterisk'>*</span>
                    </Label>
                    <Input
                      id='lastName'
                      name='lastName'
                      value={formData.lastName}
                      onChange={handleInputChangeWithValidation}
                      required
                      maxLength={50}
                      className={
                        getFieldError('lastName')
                          ? 'border-red-500 focus:border-red-500'
                          : ''
                      }
                    />
                    {getFieldError('lastName') && (
                      <p className='text-sm text-red-600'>
                        {getFieldError('lastName')}
                      </p>
                    )}
                  </div>
                </div>

                <div className='grid grid-cols-1 md:grid-cols-2 gap-6'>
                  <div className='space-y-2'>
                    <Label htmlFor='email'>
                      Email Address <span className='required-asterisk'>*</span>
                    </Label>
                    <Input
                      id='email'
                      name='email'
                      type='email'
                      value={formData.email}
                      onChange={handleInputChangeWithValidation}
                      required
                      placeholder='example@email.com'
                      className={
                        getFieldError('email')
                          ? 'border-red-500 focus:border-red-500'
                          : formData.email && validateEmail(formData.email)
                          ? 'border-green-500 focus:border-green-500'
                          : ''
                      }
                    />
                    {getFieldError('email') && (
                      <p className='text-sm text-red-600'>
                        {getFieldError('email')}
                      </p>
                    )}
                  </div>
                  <div className='space-y-2'>
                    <Label htmlFor='phoneNumber'>
                      Phone Number <span className='required-asterisk'>*</span>
                    </Label>
                    <Input
                      id='phoneNumber'
                      name='phoneNumber'
                      type='tel'
                      value={formData.phoneNumber}
                      onChange={handleInputChangeWithValidation}
                      placeholder='+234-xxx-xxx-xxxx'
                      required
                      className={
                        getFieldError('phoneNumber')
                          ? 'border-red-500 focus:border-red-500'
                          : formData.phoneNumber &&
                            validatePhone(formData.phoneNumber)
                          ? 'border-green-500 focus:border-green-500'
                          : ''
                      }
                    />
                    {getFieldError('phoneNumber') && (
                      <p className='text-sm text-red-600'>
                        {getFieldError('phoneNumber')}
                      </p>
                    )}
                  </div>
                </div>

                <div className='grid grid-cols-1 md:grid-cols-2 gap-6'>
                  <div className='space-y-2'>
                    <Label htmlFor='gender'>
                      Gender <span className='required-asterisk'>*</span>
                    </Label>
                    <Select
                      name='gender'
                      value={formData.gender}
                      onValueChange={(value) =>
                        handleSelectChangeWithValidation('gender', value)
                      }
                    >
                      <SelectTrigger
                        className={
                          getFieldError('gender')
                            ? 'border-red-500 focus:border-red-500'
                            : ''
                        }
                      >
                        <SelectValue placeholder='Select gender' />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value='male'>Male</SelectItem>
                        <SelectItem value='female'>Female</SelectItem>
                      </SelectContent>
                    </Select>
                    {getFieldError('gender') && (
                      <p className='text-sm text-red-600'>
                        {getFieldError('gender')}
                      </p>
                    )}
                  </div>
                  <div className='space-y-2'>
                    <Label htmlFor='country'>
                      Country <span className='required-asterisk'>*</span>
                    </Label>
                    <Select
                      name='country'
                      value={formData.countryId.toString()}
                      onValueChange={(value) => {
                        handleCountryChange(value);
                        clearFieldError('country');
                      }}
                    >
                      <SelectTrigger
                        className={
                          getFieldError('country')
                            ? 'border-red-500 focus:border-red-500'
                            : ''
                        }
                      >
                        <SelectValue placeholder='Select country' />
                      </SelectTrigger>
                      <SelectContent>
                        {getCountries().map(
                          (country: { id: number; name: string }) => (
                            <SelectItem
                              key={country.id}
                              value={country.id.toString()}
                            >
                              {country.name}
                            </SelectItem>
                          )
                        )}
                      </SelectContent>
                    </Select>
                    {getFieldError('country') && (
                      <p className='text-sm text-red-600'>
                        {getFieldError('country')}
                      </p>
                    )}
                  </div>
                </div>

                <div className='grid grid-cols-1 md:grid-cols-2 gap-6'>
                  <div className='space-y-2'>
                    <Label htmlFor='state'>
                      State <span className='required-asterisk'>*</span>
                    </Label>
                    <Select
                      name='state'
                      value={
                        formData.stateId && formData.stateId !== 0
                          ? formData.stateId.toString()
                          : ''
                      }
                      onValueChange={(value) => {
                        handleStateChange(value);
                        clearFieldError('state');
                      }}
                      disabled={
                        !formData.countryId || availableStates.length === 0
                      }
                    >
                      <SelectTrigger
                        className={
                          getFieldError('state')
                            ? 'border-red-500 focus:border-red-500'
                            : ''
                        }
                      >
                        <SelectValue
                          placeholder={
                            !formData.countryId
                              ? 'Select country first'
                              : availableStates.length === 0
                              ? 'No states available'
                              : 'Select state'
                          }
                        />
                      </SelectTrigger>
                      <SelectContent>
                        {availableStates.map((state) => (
                          <SelectItem
                            key={state.id}
                            value={state.id.toString()}
                          >
                            {state.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    {getFieldError('state') && (
                      <p className='text-sm text-red-600'>
                        {getFieldError('state')}
                      </p>
                    )}
                  </div>
                </div>

                <div className='space-y-2'>
                  <Label htmlFor='educationalBackground'>
                    Educational Background
                  </Label>
                  <Textarea
                    id='educationalBackground'
                    name='educationalBackground'
                    value={formData.educationalBackground}
                    onChange={handleInputChangeWithValidation}
                    placeholder='e.g., BSc Computer Science, University of Lagos (2020) - Optional'
                    rows={3}
                    maxLength={200}
                    className={
                      getFieldError('educationalBackground')
                        ? 'border-red-500 focus:border-red-500'
                        : ''
                    }
                  />
                  {getFieldError('educationalBackground') && (
                    <p className='text-sm text-red-600'>
                      {getFieldError('educationalBackground')}
                    </p>
                  )}
                  <p
                    className={`text-xs ${
                      formData.educationalBackground.length > 180
                        ? 'text-orange-500'
                        : 'text-gray-500'
                    }`}
                  >
                    {formData.educationalBackground.length}/200 characters
                  </p>
                </div>
              </div>
            )}

            {/* Track Selection Step */}
            {currentStep === 'track-selection' && (
              <div className='space-y-6'>
                <div className='text-center mb-8'>
                  <CardTitle className='text-3xl mb-2'>
                    Choose Your Track
                  </CardTitle>
                  <CardDescription className='text-lg'>
                    Select the program that aligns with your career goals
                  </CardDescription>
                </div>

                {/* Track Cards - Clean Design */}
                <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4'>
                  {tracks.map((track) => {
                    const isSelected = formData.trackId === track.trackId;

                    return (
                      <div
                        key={track._id}
                        onClick={() => handleTrackSelection(track.trackId)}
                        className={`cursor-pointer rounded-xl border-2 p-6 transition-all hover:shadow-lg ${
                          isSelected
                            ? 'border-blue-500 bg-blue-50 shadow-lg ring-2 ring-blue-200'
                            : 'border-gray-200 hover:border-blue-300 hover:shadow-md'
                        }`}
                      >
                        <div className='flex flex-col items-center text-center'>
                          <div
                            className={`p-3 rounded-full mb-4 ${
                              isSelected ? 'bg-blue-100' : 'bg-gray-100'
                            }`}
                          >
                            <Code
                              className={`h-8 w-8 ${
                                isSelected ? 'text-blue-600' : 'text-gray-600'
                              }`}
                            />
                          </div>
                          <h3
                            className={`font-semibold text-lg mb-2 ${
                              isSelected ? 'text-blue-900' : 'text-gray-900'
                            }`}
                          >
                            {track.name}
                          </h3>

                          {isSelected && (
                            <div className='flex items-center text-blue-600 mt-2'>
                              <CheckCircle className='h-5 w-5 mr-1' />
                              <span className='text-sm font-medium'>
                                Selected
                              </span>
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* Track Selection Error */}
                {getFieldError('trackId') && (
                  <Alert variant='destructive' className='mt-4'>
                    <AlertDescription>
                      {getFieldError('trackId')}
                    </AlertDescription>
                  </Alert>
                )}

                {/* Tools Selection - Show when track is selected */}
                {formData.trackId && (
                  <div className='space-y-4'>
                    <div className='text-center'>
                      <h3 className='text-xl font-semibold text-gray-900 mb-2'>
                        Tools & Technologies{' '}
                        <span className='required-asterisk'>*</span>
                      </h3>
                      <p className='text-gray-600'>
                        Select at least one tool you have experience with or are
                        interested in learning
                      </p>
                    </div>

                    <div className='space-y-4'>
                      <div className='flex flex-wrap gap-2'>
                        {selectedTrackTools.map((tool) => (
                          <button
                            key={tool}
                            type='button'
                            onClick={() => {
                              if (formData.tools.includes(tool)) {
                                removeTool(tool);
                              } else {
                                addTool(tool);
                              }
                            }}
                            className={`px-3 py-1 rounded-full text-sm font-medium transition-colors ${
                              formData.tools.includes(tool)
                                ? 'bg-blue-500 text-white'
                                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                            }`}
                          >
                            {tool}
                          </button>
                        ))}
                      </div>

                      {formData.tools.length > 0 && (
                        <div className='mt-4'>
                          <p className='text-sm text-gray-600 mb-2'>
                            Selected tools:
                          </p>
                          <div className='flex flex-wrap gap-2'>
                            {formData.tools.map((tool) => (
                              <Badge
                                key={tool}
                                variant='secondary'
                                className='flex items-center gap-1'
                              >
                                {tool}
                                <button
                                  type='button'
                                  onClick={() => removeTool(tool)}
                                  className='ml-1 text-gray-500 hover:text-red-500'
                                >
                                  ×
                                </button>
                              </Badge>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Tools Selection Error */}
                      {getFieldError('tools') && (
                        <p className='text-sm text-red-600 mt-2'>
                          {getFieldError('tools')}
                        </p>
                      )}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Background & Experience Step */}
            {currentStep === 'background' && (
              <div className='space-y-6'>
                <div className='text-center mb-8'>
                  <CardTitle className='text-3xl mb-2'>
                    Experience & Background
                  </CardTitle>
                  <CardDescription className='text-lg'>
                    Tell us about your experience and goals
                  </CardDescription>
                </div>

                {/* Years of Experience */}
                <div className='space-y-2'>
                  <Label htmlFor='yearsOfExperience'>
                    How many years of experience do you have in{' '}
                    {tracks.find((t) => t.trackId === formData.trackId)?.name ||
                      'this field'}
                    ? <span className='required-asterisk'>*</span>
                  </Label>
                  <Select
                    onValueChange={(value) =>
                      handleSelectChangeWithValidation(
                        'yearsOfExperience',
                        value
                      )
                    }
                  >
                    <SelectTrigger
                      className={
                        getFieldError('yearsOfExperience')
                          ? 'border-red-500 focus:border-red-500'
                          : ''
                      }
                    >
                      <SelectValue placeholder='Select your experience level' />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value='less-than-1'>
                        Less than 1 year
                      </SelectItem>
                      <SelectItem value='1-2'>1-2 years</SelectItem>
                      <SelectItem value='2-3'>2-3 years</SelectItem>
                      <SelectItem value='above-3'>Above 3 years</SelectItem>
                    </SelectContent>
                  </Select>
                  {getFieldError('yearsOfExperience') && (
                    <p className='text-sm text-red-600'>
                      {getFieldError('yearsOfExperience')}
                    </p>
                  )}
                </div>

                {/* GitHub Link for Programming Tracks */}
                {[
                  'frontend-development',
                  'backend-development',
                  'fullstack-development',
                  'mobile-development',
                ].includes(formData.trackId) && (
                  <div className='space-y-2'>
                    <Label htmlFor='githubLink'>GitHub Profile Link *</Label>
                    <Input
                      id='githubLink'
                      name='githubLink'
                      type='url'
                      value={formData.githubLink}
                      onChange={handleInputChangeWithValidation}
                      placeholder='https://github.com/yourusername'
                      required
                      className={
                        getFieldError('githubLink')
                          ? 'border-red-500 focus:border-red-500'
                          : formData.githubLink &&
                            validateGitHubUrl(formData.githubLink)
                          ? 'border-green-500 focus:border-green-500'
                          : ''
                      }
                    />
                    {getFieldError('githubLink') && (
                      <p className='text-sm text-red-600'>
                        {getFieldError('githubLink')}
                      </p>
                    )}
                  </div>
                )}

                {/* Portfolio Link */}
                <div className='space-y-2'>
                  <Label htmlFor='portfolioLink'>
                    {[
                      'frontend-development',
                      'backend-development',
                      'fullstack-development',
                      'mobile-development',
                    ].includes(formData.trackId)
                      ? 'Portfolio/Project Link *'
                      : 'Portfolio Link *'}
                  </Label>
                  <Input
                    id='portfolioLink'
                    name='portfolioLink'
                    type='url'
                    value={formData.portfolioLink}
                    onChange={handleInputChangeWithValidation}
                    placeholder={
                      [
                        'frontend-development',
                        'backend-development',
                        'fullstack-development',
                        'mobile-development',
                      ].includes(formData.trackId)
                        ? 'https://yourproject.com or https://github.com/username/project'
                        : 'https://yourportfolio.com'
                    }
                    required
                    className={
                      getFieldError('portfolioLink')
                        ? 'border-red-500 focus:border-red-500'
                        : formData.portfolioLink &&
                          validateUrl(formData.portfolioLink)
                        ? 'border-green-500 focus:border-green-500'
                        : ''
                    }
                  />
                  {getFieldError('portfolioLink') && (
                    <p className='text-sm text-red-600'>
                      {getFieldError('portfolioLink')}
                    </p>
                  )}
                </div>

                {/* Career Goals */}
                <div className='space-y-2'>
                  <Label htmlFor='careerGoals'>
                    What are your career goals in the next two years? *
                  </Label>
                  <Textarea
                    id='careerGoals'
                    name='careerGoals'
                    value={formData.careerGoals}
                    onChange={handleInputChangeWithValidation}
                    placeholder='Describe your career aspirations and what you hope to achieve in the next 2 years...'
                    rows={4}
                    required
                    maxLength={500}
                    className={
                      getFieldError('careerGoals')
                        ? 'border-red-500 focus:border-red-500'
                        : ''
                    }
                  />
                  {getFieldError('careerGoals') && (
                    <p className='text-sm text-red-600'>
                      {getFieldError('careerGoals')}
                    </p>
                  )}
                  <p
                    className={`text-xs ${
                      formData.careerGoals.length > 450
                        ? 'text-orange-500'
                        : 'text-gray-500'
                    }`}
                  >
                    {formData.careerGoals.length}/500 characters
                  </p>
                </div>

                {/* Weekly Commitment */}
                <div className='space-y-2'>
                  <Label htmlFor='weeklyCommitment'>
                    Are you able to commit at least 40 hours per week to
                    participate fully in the fellowship? *
                  </Label>
                  <Select
                    onValueChange={(value) =>
                      handleSelectChangeWithValidation(
                        'weeklyCommitment',
                        value
                      )
                    }
                  >
                    <SelectTrigger
                      className={
                        getFieldError('weeklyCommitment')
                          ? 'border-red-500 focus:border-red-500'
                          : ''
                      }
                    >
                      <SelectValue placeholder='Select your commitment level' />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value='yes'>Yes</SelectItem>
                      <SelectItem value='no'>No</SelectItem>
                    </SelectContent>
                  </Select>
                  {getFieldError('weeklyCommitment') && (
                    <p className='text-sm text-red-600'>
                      {getFieldError('weeklyCommitment')}
                    </p>
                  )}
                </div>

                {/* Referral Source */}
                <div className='space-y-2'>
                  <Label htmlFor='referralSource'>
                    How did you hear about us? *
                  </Label>
                  <Select
                    onValueChange={(value) => {
                      handleSelectChangeWithValidation('referralSource', value);
                      if (value !== 'other') {
                        setFormData((prev) => ({
                          ...prev,
                          referralSourceOther: '',
                        }));
                      }
                    }}
                  >
                    <SelectTrigger
                      className={
                        getFieldError('referralSource')
                          ? 'border-red-500 focus:border-red-500'
                          : ''
                      }
                    >
                      <SelectValue placeholder='Select how you heard about us' />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value='linkedin'>LinkedIn</SelectItem>
                      <SelectItem value='twitter'>Twitter</SelectItem>
                      <SelectItem value='instagram'>Instagram</SelectItem>
                      <SelectItem value='facebook'>Facebook</SelectItem>
                      <SelectItem value='friend-referral'>
                        Friend Referral
                      </SelectItem>
                      <SelectItem value='google-search'>
                        Google Search
                      </SelectItem>
                      <SelectItem value='job-board'>Job Board</SelectItem>
                      <SelectItem value='university'>
                        University/School
                      </SelectItem>
                      <SelectItem value='other'>Other</SelectItem>
                    </SelectContent>
                  </Select>
                  {getFieldError('referralSource') && (
                    <p className='text-sm text-red-600'>
                      {getFieldError('referralSource')}
                    </p>
                  )}
                </div>

                {/* Other Referral Source */}
                {formData.referralSource === 'other' && (
                  <div className='space-y-2'>
                    <Label htmlFor='referralSourceOther'>
                      Please specify how you heard about us *
                    </Label>
                    <Input
                      id='referralSourceOther'
                      name='referralSourceOther'
                      value={formData.referralSourceOther}
                      onChange={handleInputChangeWithValidation}
                      placeholder='Please specify...'
                      required
                      className={
                        getFieldError('referralSourceOther')
                          ? 'border-red-500 focus:border-red-500'
                          : ''
                      }
                    />
                    {getFieldError('referralSourceOther') && (
                      <p className='text-sm text-red-600'>
                        {getFieldError('referralSourceOther')}
                      </p>
                    )}
                  </div>
                )}

                {/* CV Upload */}
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
            )}

            {/* Final Review Step */}
            {currentStep === 'final-review' && (
              <div className='space-y-6'>
                <div className='text-center mb-8'>
                  <CardTitle className='text-3xl mb-2'>
                    Review Your Application
                  </CardTitle>
                  <CardDescription className='text-lg'>
                    Please review all information before submitting
                  </CardDescription>
                </div>

                <div className='space-y-6'>
                  {/* Personal Information */}
                  <div className='bg-gray-50 rounded-lg p-6'>
                    <h3 className='text-lg font-semibold border-b pb-2 mb-4'>
                      Personal Information
                    </h3>
                    <div className='grid grid-cols-1 md:grid-cols-2 gap-4 text-sm'>
                      <p>
                        <span className='font-medium'>Name:</span>{' '}
                        {formData.firstName} {formData.lastName}
                      </p>
                      <p>
                        <span className='font-medium'>Email:</span>{' '}
                        {formData.email}
                      </p>
                      <p>
                        <span className='font-medium'>Phone:</span>{' '}
                        {formData.phoneNumber}
                      </p>
                      <p className='md:col-span-2'>
                        <span className='font-medium'>Education:</span>{' '}
                        {formData.educationalBackground}
                      </p>
                    </div>
                  </div>

                  {/* Track Selection */}
                  <div className='bg-gray-50 rounded-lg p-6'>
                    <h3 className='text-lg font-semibold border-b pb-2 mb-4'>
                      Selected Track
                    </h3>
                    <p className='text-sm'>
                      <span className='font-medium'>Track:</span>{' '}
                      {tracks.find((t) => t.trackId === formData.trackId)?.name}
                    </p>
                    <p className='text-sm mt-2'>
                      <span className='font-medium'>Cohort:</span>{' '}
                      {activeCohort?.name}
                    </p>
                  </div>

                  {/* Experience & Background */}
                  <div className='bg-gray-50 rounded-lg p-6'>
                    <h3 className='text-lg font-semibold border-b pb-2 mb-4'>
                      Experience & Background
                    </h3>
                    <div className='space-y-3 text-sm'>
                      <p>
                        <span className='font-medium'>
                          Years of Experience:
                        </span>{' '}
                        {formData.yearsOfExperience}
                      </p>
                      {formData.githubLink && (
                        <p>
                          <span className='font-medium'>GitHub:</span>{' '}
                          <a
                            href={formData.githubLink}
                            target='_blank'
                            rel='noopener noreferrer'
                            className='text-blue-600 hover:underline'
                          >
                            {formData.githubLink}
                          </a>
                        </p>
                      )}
                      <p>
                        <span className='font-medium'>Portfolio/Project:</span>{' '}
                        <a
                          href={formData.portfolioLink}
                          target='_blank'
                          rel='noopener noreferrer'
                          className='text-blue-600 hover:underline'
                        >
                          {formData.portfolioLink}
                        </a>
                      </p>
                      <p>
                        <span className='font-medium'>Weekly Commitment:</span>{' '}
                        {formData.weeklyCommitment}
                      </p>
                      <p>
                        <span className='font-medium'>
                          How you heard about us:
                        </span>{' '}
                        {formData.referralSource === 'other' &&
                        formData.referralSourceOther
                          ? `Other (${formData.referralSourceOther})`
                          : formData.referralSource}
                      </p>
                      <p>
                        <span className='font-medium'>CV:</span> {cvFile?.name}
                      </p>
                      <div>
                        <span className='font-medium'>
                          Career Goals (Next 2 Years):
                        </span>
                        <p className='mt-1 text-gray-700 bg-white p-3 rounded border'>
                          {formData.careerGoals}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Submit Button */}
                <div className='pt-6'>
                  <Button
                    onClick={handleSubmit}
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
              </div>
            )}

            {/* Navigation Buttons */}
            {currentStep !== 'final-review' && (
              <div className='flex justify-between pt-8 border-t'>
                <Button
                  type='button'
                  variant='outline'
                  onClick={prevStep}
                  disabled={currentStep === 'about'}
                  className='flex items-center'
                >
                  <ChevronLeft className='h-4 w-4 mr-1' />
                  Previous
                </Button>

                <Button
                  type='button'
                  onClick={nextStep}
                  disabled={!isStepValid()}
                  className='flex items-center'
                >
                  Next
                  <ChevronRight className='h-4 w-4 ml-1' />
                </Button>
              </div>
            )}

            {currentStep === 'final-review' && (
              <div className='flex justify-between pt-8 border-t'>
                <Button
                  type='button'
                  variant='outline'
                  onClick={prevStep}
                  className='flex items-center'
                >
                  <ChevronLeft className='h-4 w-4 mr-1' />
                  Previous
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
