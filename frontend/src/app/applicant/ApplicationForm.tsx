'use client';

import { useState, useEffect, useMemo } from 'react';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import { toast } from 'sonner';
import {
  Upload,
  FileText,
  CheckCircle2,
  Eye,
  Trash2,
  Users,
  Mail,
  Phone,
  User,
  Globe,
  Loader2,
} from 'lucide-react';
import Image from 'next/image';
import Box from '@/components/ui/box';
import logo from '../../../public/upticklogo.svg';

// ✅ Interface for form values
interface ApplicationFormValues {
  firstName: string;
  lastName: string;
  email: string;
  phoneNumber: string;
  gender: string;
  country: string;
  state: string;
  trackId: string;
  tools: string[];
  cohortNumber: string;
  cv: File | null;
  otherCountry: string;
  otherState: string;
  referralSource: string;
  motivation: string;
}

// ✅ Simplified interfaces for API response
interface Track {
  _id: string;
  name: string;
}

interface Cohort {
  cohortNumber: string;
  tracks: Track[];
}

interface ApiResponse {
  success: boolean;
  message: string;
  data: Cohort;
}

// ✅ Validation schema
const validationSchema = Yup.object({
  firstName: Yup.string().required('First name is required'),
  lastName: Yup.string().required('Last name is required'),
  email: Yup.string().email('Invalid email address').required('Email is required'),
  phoneNumber: Yup.string().required('Phone number is required'),
  gender: Yup.string().required('Gender is required'),
  country: Yup.string().required('Country is required'),
  state: Yup.string().required('State is required'),
  trackId: Yup.string().required('Please select a track'),
  cv: Yup.mixed().required('CV is required'),
  tools: Yup.array()
    .min(1, 'Please select at least one tool')
    .required('Please select at least one tool'),
  referralSource: Yup.string().required('Referral source is required'),
  motivation: Yup.string().required('Motivation is required'),
  otherCountry: Yup.string().when('country', {
    is: 'Other',
    then: schema => schema.required('Please specify your country'),
    otherwise: schema => schema.notRequired(),
  }),
  otherState: Yup.string().when('state', {
    is: 'Other',
    then: schema => schema.required('Please specify your state/province'),
    otherwise: schema => schema.notRequired(),
  }),
});

const baseUrl = 'https://uptick-lms-backend.onrender.com';

// ✅ Map track names to expected track IDs
const trackNameToIdMap: Record<string, string> = {
  'Frontend Development': 'frontend-development',
  'Backend Development': 'backend-development',
  'Full Stack Development': 'fullstack-development',
  'Mobile Development': 'mobile-development',
  'Product Management': 'product-management',
  'Product Design': 'product-design',
  'Data Science': 'data-science',
  'DevOps Engineering': 'devops-engineering',
  'Blockchain Development': 'blockchain-development',
  DevOps: 'devops-engineering',
};

export default function ApplicationForm() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [showSuccess, setShowSuccess] = useState(false);
  const [availableTracks, setAvailableTracks] = useState<Track[]>([]);

  // Fetch cohort number and tracks from API
  useEffect(() => {
    const fetchCohortData = async () => {
      try {
        const response = await fetch(`${baseUrl}/api/cohorts/current-active`);
        if (!response.ok) {
          throw new Error(`Failed to fetch cohort data: ${response.status}`);
        }

        const apiResponse: ApiResponse = await response.json();
        console.log('API Response:', apiResponse);

        if (apiResponse.success && apiResponse.data) {
          const cohort = apiResponse.data;
          console.log('Cohort data found:', {
            cohortNumber: cohort.cohortNumber,
            tracks: cohort.tracks,
          });

          setAvailableTracks(cohort.tracks);

          // Set cohort number in form automatically
          formik.setFieldValue('cohortNumber', cohort.cohortNumber);
          console.log('Automatically set cohortNumber to:', cohort.cohortNumber);
        } else {
          throw new Error('No active cohorts found');
        }
      } catch (error) {
        console.error('Error fetching cohort data:', error);
        toast.error('Failed to load cohort information. Please refresh the page.');
      }
    };

    fetchCohortData();
  }, []);

  const formik = useFormik<ApplicationFormValues>({
    initialValues: {
      firstName: '',
      lastName: '',
      email: '',
      phoneNumber: '',
      gender: '',
      country: '',
      state: '',
      trackId: '',
      tools: [],
      cohortNumber: '', // Will be set automatically by useEffect
      cv: null,
      otherCountry: '',
      otherState: '',
      referralSource: '',
      motivation: '',
    },
    validationSchema,
    enableReinitialize: true,
    onSubmit: async values => {
      setIsSubmitting(true);
      setUploadProgress(0);

      const progressInterval = setInterval(() => {
        setUploadProgress(prev => {
          if (prev >= 90) {
            clearInterval(progressInterval);
            return 90;
          }
          return prev + 10;
        });
      }, 200);

      try {
        // Validate we have a cohort number
        if (!values.cohortNumber) {
          throw new Error('Cohort information is missing. Please refresh the page.');
        }

        const formData = new FormData();

        // Use actual country/state values
        const finalCountry = values.country === 'Other' ? values.otherCountry : values.country;
        const finalState = values.state === 'Other' ? values.otherState : values.state;

        // Append all fields exactly as API expects
        formData.append('firstName', values.firstName);
        formData.append('lastName', values.lastName);
        formData.append('email', values.email);
        formData.append('phoneNumber', values.phoneNumber);
        formData.append('gender', values.gender);
        formData.append('country', finalCountry);
        formData.append('state', finalState);
        formData.append('trackId', values.trackId);
        formData.append('cohortNumber', values.cohortNumber);
        formData.append('referralSource', values.referralSource);
        formData.append('motivation', values.motivation);

        // Append tools array
        if (values.tools.length > 0) {
          values.tools.forEach(tool => {
            formData.append('tools', tool);
          });
        }

        if (values.cv) {
          formData.append('cv', values.cv);
        }

        console.log('Submitting form data:', {
          firstName: values.firstName,
          lastName: values.lastName,
          email: values.email,
          phoneNumber: values.phoneNumber,
          gender: values.gender,
          country: finalCountry,
          state: finalState,
          trackId: values.trackId,
          cohortNumber: values.cohortNumber,
          tools: values.tools,
          referralSource: values.referralSource,
          motivation: values.motivation,
          hasCV: !!values.cv,
        });

        const response = await fetch(`${baseUrl}/api/applications/apply`, {
          method: 'POST',
          body: formData,
        });

        const responseData = await response.json();
        console.log('Application API Response:', responseData);

        if (!response.ok) {
          // Handle specific error cases
          if (
            responseData.message?.includes('already applied') ||
            responseData.message?.includes('already exists')
          ) {
            throw new Error(
              `You have already applied for Cohort ${values.cohortNumber}. You cannot submit multiple applications for the same cohort.`,
            );
          } else if (responseData.message?.includes('cohort') || response.status === 404) {
            throw new Error(
              `Cohort not found: "${values.cohortNumber}". Available cohorts might have changed. Please refresh the page.`,
            );
          } else if (response.status === 409) {
            throw new Error('You have already applied with this email address for this cohort.');
          }
          throw new Error(responseData.message || `Server error: ${response.status}`);
        }

        clearInterval(progressInterval);
        setUploadProgress(100);
        toast.success('Application submitted successfully!');
        setShowSuccess(true);

        setTimeout(() => {
          formik.resetForm();
          setUploadProgress(0);
          setShowSuccess(false);
          // Reset file input
          const fileInput = document.getElementById('cv-upload') as HTMLInputElement;
          if (fileInput) fileInput.value = '';
        }, 10000);
      } catch (error: any) {
        console.error('Submission error:', error);

        clearInterval(progressInterval);

        if (error.message.includes('Network Error')) {
          toast.error('Network error. Please check your connection.');
        } else if (error.message.includes('already applied')) {
          toast.error(error.message, {
            action: {
              label: 'Understand',
              onClick: () => {},
            },
          });
        } else if (error.message.includes('Cohort not found')) {
          toast.error(error.message);
        } else if (error.message.includes('400')) {
          toast.error('Invalid data. Please check your inputs.');
        } else if (error.message.includes('500')) {
          toast.error('Server error. Please try again later.');
        } else if (error.message.includes('409')) {
          toast.error('You have already applied with this email address.');
        } else {
          toast.error(error.message || 'Failed to submit application. Please try again.');
        }
      } finally {
        setIsSubmitting(false);
      }
    },
  });

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.currentTarget.files?.[0];
    if (file) {
      const allowedTypes = ['application/pdf'];
      const maxSize = 10 * 1024 * 1024;

      if (!allowedTypes.includes(file.type)) {
        toast.error('Please upload a PDF document only');
        e.currentTarget.value = '';
        return;
      }

      if (file.size > maxSize) {
        toast.error('File size must be less than 10MB');
        e.currentTarget.value = '';
        return;
      }

      formik.setFieldValue('cv', file);
    }
  };

  const handleRemoveFile = () => {
    formik.setFieldValue('cv', null);
    const fileInput = document.getElementById('cv-upload') as HTMLInputElement;
    if (fileInput) fileInput.value = '';
  };

  const handleViewFile = () => {
    if (formik.values.cv) {
      const fileURL = URL.createObjectURL(formik.values.cv);
      window.open(fileURL, '_blank');
    }
  };

  const referralSources = useMemo(
    () => [
      'LinkedIn',
      'Twitter',
      'Facebook',
      'Instagram',
      'WhatsApp',
      'YouTube',
      'GitHub',
      'From a friend',
      'Career Website',
      'University/College',
      'Other',
    ],
    [],
  );

  // Use tracks from API response and map to expected track IDs
  const tracks = useMemo(() => {
    return availableTracks.map(track => {
      const trackId = trackNameToIdMap[track.name] || track.name.toLowerCase().replace(/\s+/g, '-');
      return {
        id: trackId, // Use the mapped track ID
        name: track.name,
        originalId: track._id, // Keep original for reference if needed
      };
    });
  }, [availableTracks]);

  const trackTools: Record<string, string[]> = useMemo(
    () => ({
      'frontend-development': [
        'React',
        'Vue.js',
        'Angular',
        'Next.js',
        'Svelte',
        'Tailwind CSS',
        'JavaScript',
        'TypeScript',
        'HTML',
        'CSS',
      ],
      'backend-development': [
        'Node.js',
        'Django',
        'Laravel',
        'Flask',
        'Spring Boot',
        'Express.js',
        'JavaScript',
        'Python',
        'Java',
        'PHP',
      ],
      'fullstack-development': [
        'MERN',
        'MEAN',
        'Django + React',
        'Laravel + Vue',
        'Next.js + Nest.js',
        'JavaScript',
        'TypeScript',
        'React',
        'Node.js',
      ],
      'mobile-development': [
        'React Native',
        'Flutter',
        'Swift',
        'Kotlin',
        'Ionic',
        'JavaScript',
        'Dart',
        'Java',
      ],
      'devops-engineering': [
        'Docker',
        'Kubernetes',
        'AWS',
        'Azure',
        'CI/CD',
        'Terraform',
        'JavaScript',
        'Python',
      ],
      'product-management': [
        'Agile',
        'Scrum',
        'JIRA',
        'User Research',
        'Roadmapping',
        'Product Strategy',
        'Market Analysis',
        'Stakeholder Management',
      ],
      'product-design': [
        'Figma',
        'Adobe XD',
        'Sketch',
        'Framer',
        'User Research',
        'Wireframing',
        'Prototyping',
        'UX Writing',
        'Design Systems',
      ],
      'data-science': [
        'Python',
        'R',
        'SQL',
        'Machine Learning',
        'Data Analysis',
        'Pandas',
        'NumPy',
        'TensorFlow',
        'PyTorch',
      ],
      'blockchain-development': [
        'Solidity',
        'Web3.js',
        'Ethereum',
        'Smart Contracts',
        'Truffle',
        'Hardhat',
        'Blockchain Fundamentals',
      ],
    }),
    [],
  );

  const countries = useMemo(
    () => [
      'Nigeria',
      'Ghana',
      'Kenya',
      'South Africa',
      'Egypt',
      'Morocco',
      'United States',
      'United Kingdom',
      'Canada',
      'Australia',
      'Other',
    ],
    [],
  );

  const statesByCountry: Record<string, string[]> = {
    Nigeria: [
      'Lagos',
      'Abuja',
      'Kano',
      'Rivers',
      'Kaduna',
      'Oyo',
      'Enugu',
      'Borno',
      'Delta',
      'Ekiti',
      'Other',
    ],
    Ghana: ['Greater Accra', 'Ashanti', 'Eastern', 'Western', 'Other'],
    Kenya: ['Nairobi', 'Mombasa', 'Kisumu', 'Nakuru', 'Other'],
    'South Africa': ['Gauteng', 'Western Cape', 'KwaZulu-Natal', 'Eastern Cape', 'Other'],
    Egypt: ['Cairo', 'Giza', 'Alexandria', 'Luxor', 'Other'],
    Morocco: ['Casablanca', 'Rabat', 'Fes', 'Marrakech', 'Other'],
    'United States': ['California', 'Texas', 'New York', 'Florida', 'Other'],
    'United Kingdom': ['England', 'Scotland', 'Wales', 'Northern Ireland', 'Other'],
    Canada: ['Ontario', 'Quebec', 'British Columbia', 'Alberta', 'Other'],
    Australia: ['New South Wales', 'Victoria', 'Queensland', 'Western Australia', 'Other'],
  };

   return (
     <Box className="min-h-screen py-3 xs:py-4 sm:py-6 md:py-8 px-3 xs:px-4 sm:px-6">
      <Box className="max-w-4xl mx-auto">
        {/* Form Card */}
        <Box className="bg-slate-900 rounded-lg xs:rounded-xl sm:rounded-2xl md:rounded-3xl shadow-lg sm:shadow-xl md:shadow-2xl overflow-hidden border border-blue-500/20">
          {/* Header Section */}
          <Box className="bg-blue-800 p-6 md:p-8 relative overflow-hidden">
            <Box className="absolute inset-0 bg-black/20"></Box>
            <Box className="relative z-10 flex flex-row justify-between items-center gap-3 sm:gap-4 md:gap-6 w-full">
              {/* Logo Container */}
              <Box className="flex items-center gap-3 sm:gap-4">
                <Box className="bg-white/15 backdrop-blur-md rounded-xl md:rounded-2xl p-3 sm:p-4 border border-white/25 shadow-lg flex items-center justify-center">
                  <Image
                    src={logo}
                    alt="Uptick Logo"
                    className="object-contain h-4 sm:w-auto sm:h-8 md:h-10 w-24"
                  />
                </Box>
              </Box>

              {/* Enhanced Cohort Number */}
              <Box className="bg-white/20 backdrop-blur-md rounded-xl md:rounded-2xl px-4 sm:px-5 py-2 sm:py-3 text-center border border-white/25 shadow-lg min-w-[140px]">
                <p className="text-sm sm:text-base md:text-lg font-bold text-white">
                  {formik.values.cohortNumber
                    ? `Cohort ${formik.values.cohortNumber}`
                    : 'Loading...'}
                </p>
              </Box>
            </Box>
          </Box>

          <Box className="p-4 sm:p-6 md:p-8">
            <form
              onSubmit={formik.handleSubmit}
              className="space-y-6 sm:space-y-8"
              noValidate
            >
              {/* Personal Information Section */}
              <Box className="space-y-4 sm:space-y-6">
                <Box className="flex items-center gap-3 sm:gap-4 mb-4 sm:mb-6">
                  <Box className="bg-blue-500/25 p-2 sm:p-3 rounded-xl border border-blue-400/40 shadow-lg">
                    <User className="h-5 w-5 sm:h-6 sm:w-6 text-blue-400" />
                  </Box>
                  <h3 className="text-lg sm:text-xl md:text-2xl font-bold text-white">
                    Personal Information
                  </h3>
                </Box>

                <Box className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
                  <Box className="space-y-2">
                    <label
                      htmlFor="firstName"
                      className="block text-sm sm:text-base font-semibold text-gray-200"
                    >
                      First Name *
                    </label>
                    <input
                      id="firstName"
                      type="text"
                      {...formik.getFieldProps('firstName')}
                      className="w-full px-4 py-3 bg-slate-700/60 border-2 border-slate-600 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 text-white placeholder-gray-400 backdrop-blur-sm text-base shadow-inner hover:border-slate-500"
                      placeholder="Enter your first name"
                    />
                    {formik.touched.firstName && formik.errors.firstName && (
                      <p className="text-red-400 text-sm mt-2 flex items-center gap-2 bg-red-500/10 px-3 py-2 rounded-lg border border-red-500/20">
                        <span className="w-1.5 h-1.5 bg-red-400 rounded-full"></span>
                        {formik.errors.firstName}
                      </p>
                    )}
                  </Box>

                  <Box className="space-y-2">
                    <label
                      htmlFor="lastName"
                      className="block text-sm sm:text-base font-semibold text-gray-200"
                    >
                      Last Name *
                    </label>
                    <input
                      id="lastName"
                      type="text"
                      {...formik.getFieldProps('lastName')}
                      className="w-full px-4 py-3 bg-slate-700/60 border-2 border-slate-600 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 text-white placeholder-gray-400 backdrop-blur-sm text-base shadow-inner hover:border-slate-500"
                      placeholder="Enter your last name"
                    />
                    {formik.touched.lastName && formik.errors.lastName && (
                      <p className="text-red-400 text-sm mt-2 flex items-center gap-2 bg-red-500/10 px-3 py-2 rounded-lg border border-red-500/20">
                        <span className="w-1.5 h-1.5 bg-red-400 rounded-full"></span>
                        {formik.errors.lastName}
                      </p>
                    )}
                  </Box>
                </Box>
              </Box>

              {/* Contact Information Section */}
              <Box className="space-y-4 sm:space-y-6">
                <Box className="flex items-center gap-3 sm:gap-4 mb-4 sm:mb-6">
                  <Box className="bg-blue-500/25 p-2 sm:p-3 rounded-xl border border-blue-400/40 shadow-lg">
                    <Mail className="h-5 w-5 sm:h-6 sm:w-6 text-blue-400" />
                  </Box>
                  <h3 className="text-lg sm:text-xl md:text-2xl font-bold text-white">
                    Contact Information
                  </h3>
                </Box>

                <Box className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
                  <Box className="space-y-2">
                    <label
                      htmlFor="email"
                      className="block text-sm sm:text-base font-semibold text-gray-200"
                    >
                      Email Address *
                    </label>
                    <Box className="relative">
                      <Mail className="absolute left-4 top-1/2 transform -translate-y-1/2 h-4 w-4 sm:h-5 sm:w-5 text-gray-400" />
                      <input
                        id="email"
                        type="email"
                        {...formik.getFieldProps('email')}
                        className="w-full pl-12 pr-4 py-3 bg-slate-700/60 border-2 border-slate-600 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 text-white placeholder-gray-400 backdrop-blur-sm text-base shadow-inner hover:border-slate-500"
                        placeholder="your.email@example.com"
                      />
                    </Box>
                    {formik.touched.email && formik.errors.email && (
                      <p className="text-red-400 text-sm mt-2 flex items-center gap-2 bg-red-500/10 px-3 py-2 rounded-lg border border-red-500/20">
                        <span className="w-1.5 h-1.5 bg-red-400 rounded-full"></span>
                        {formik.errors.email}
                      </p>
                    )}
                  </Box>

                  <Box className="space-y-2">
                    <label
                      htmlFor="phoneNumber"
                      className="block text-sm sm:text-base font-semibold text-gray-200"
                    >
                      Phone Number *
                    </label>
                    <Box className="relative">
                      <Phone className="absolute left-4 top-1/2 transform -translate-y-1/2 h-4 w-4 sm:h-5 sm:w-5 text-gray-400" />
                      <input
                        id="phoneNumber"
                        type="tel"
                        {...formik.getFieldProps('phoneNumber')}
                        className="w-full pl-12 pr-4 py-3 bg-slate-700/60 border-2 border-slate-600 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 text-white placeholder-gray-400 backdrop-blur-sm text-base shadow-inner hover:border-slate-500"
                        placeholder="+1234567890"
                      />
                    </Box>
                    {formik.touched.phoneNumber && formik.errors.phoneNumber && (
                      <p className="text-red-400 text-sm mt-2 flex items-center gap-2 bg-red-500/10 px-3 py-2 rounded-lg border border-red-500/20">
                        <span className="w-1.5 h-1.5 bg-red-400 rounded-full"></span>
                        {formik.errors.phoneNumber}
                      </p>
                    )}
                  </Box>
                </Box>
              </Box>

              {/* Location & Gender Section */}
              <Box className="space-y-4 sm:space-y-6">
                <Box className="flex items-center gap-3 sm:gap-4 mb-4 sm:mb-6">
                  <Box className="bg-blue-500/25 p-2 sm:p-3 rounded-xl border border-blue-400/40 shadow-lg">
                    <Globe className="h-5 w-5 sm:h-6 sm:w-6 text-blue-400" />
                  </Box>
                  <h3 className="text-lg sm:text-xl md:text-2xl font-bold text-white">
                    Location & Gender
                  </h3>
                </Box>

                <Box className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
                  {/* Gender Dropdown */}
                  <Box className="space-y-2">
                    <label htmlFor="gender" className="block text-sm sm:text-base font-semibold text-gray-200">
                      Gender *
                    </label>
                    <select
                      id="gender"
                      {...formik.getFieldProps('gender')}
                      className="w-full px-4 py-3 bg-slate-700/60 border-2 border-slate-600 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 text-white text-sm sm:text-base appearance-none backdrop-blur-sm shadow-inner"
                    >
                      <option value="" className="bg-slate-800">Select gender</option>
                      {['male', 'female', 'other'].map((gender) => (
                        <option key={gender} value={gender} className="bg-slate-800">{gender}</option>
                      ))}
                    </select>
                    {formik.touched.gender && formik.errors.gender && (
                      <p className="text-red-400 text-sm mt-2 flex items-center gap-2 bg-red-500/10 px-3 py-2 rounded-lg border border-red-500/20">
                        <span className="w-1.5 h-1.5 bg-red-400 rounded-full"></span>
                        {formik.errors.gender}
                      </p>
                    )}
                  </Box>
                  

                  {/* Country Dropdown */}
                  <Box className="space-y-2">
                    <label
                      htmlFor="country"
                      className="block text-sm sm:text-base font-semibold text-gray-200"
                    >
                      Country *
                    </label>
                    <select
                      id="country"
                      {...formik.getFieldProps('country')}
                      className="w-full px-4 py-3 bg-slate-700/60 border-2 border-slate-600 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 text-white text-sm sm:text-base appearance-none backdrop-blur-sm shadow-inner"
                    >
                      <option value="" className="bg-slate-800">Select Country</option>
                      {countries.map(country => (
                        <option key={country} value={country} className="bg-slate-800">
                          {country}
                        </option>
                      ))}
                    </select>
                    {formik.touched.country && formik.errors.country && (
                      <p className="text-red-400 text-sm mt-2 flex items-center gap-2 bg-red-500/10 px-3 py-2 rounded-lg border border-red-500/20">
                        <span className="w-1.5 h-1.5 bg-red-400 rounded-full"></span>
                        {formik.errors.country}
                      </p>
                    )}

                    {/* Other Country Input */}
                    {formik.values.country === 'Other' && (
                      <Box className="mt-4 p-4 bg-blue-500/15 rounded-xl border-2 border-blue-500/30">
                        <label
                          htmlFor="otherCountry"
                          className="block text-sm sm:text-base font-semibold text-gray-200 mb-3"
                        >
                          Specify Your Country *
                        </label>
                        <input
                          id="otherCountry"
                          type="text"
                          {...formik.getFieldProps('otherCountry')}
                          className="w-full px-4 py-3 bg-slate-700/60 border-2 border-blue-500/40 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 text-white placeholder-gray-400 text-base shadow-inner"
                          placeholder="Enter your country name"
                        />
                        {formik.touched.otherCountry && formik.errors.otherCountry && (
                          <p className="text-red-400 text-sm mt-2 flex items-center gap-2 bg-red-500/10 px-3 py-2 rounded-lg border border-red-500/20">
                            <span className="w-1.5 h-1.5 bg-red-400 rounded-full"></span>
                            {formik.errors.otherCountry}
                          </p>
                        )}
                      </Box>
                    )}
                  </Box>

                  {/* State/Province Dropdown */}
                  <Box className="space-y-2">
                    <label
                      htmlFor="state"
                      className="block text-sm sm:text-base font-semibold text-gray-200"
                    >
                      State/Province *
                    </label>
                    {formik.values.country && formik.values.country !== 'Other' ? (
                      <select
                        id="state"
                        {...formik.getFieldProps('state')}
                        className="w-full px-4 py-3 bg-slate-700/60 border-2 border-slate-600 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 text-white text-sm sm:text-base appearance-none backdrop-blur-sm shadow-inner"
                      >
                        <option value="" className="bg-slate-800">Select State/Province</option>
                        {statesByCountry[formik.values.country]?.map(state => (
                          <option key={state} value={state} className="bg-slate-800">
                            {state}
                          </option>
                        ))}
                      </select>
                    ) : (
                      <input
                        id="state"
                        type="text"
                        {...formik.getFieldProps('state')}
                        className="w-full px-4 py-3 bg-slate-700/60 border-2 border-slate-600 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 text-white placeholder-gray-400 backdrop-blur-sm text-base shadow-inner hover:border-slate-500"
                        placeholder="Enter your state or province"
                      />
                    )}

                    {/* Other State Input */}
                    {formik.values.state === 'Other' && (
                      <Box className="mt-4 p-4 bg-blue-500/15 rounded-xl border-2 border-blue-500/30">
                        <label
                          htmlFor="otherState"
                          className="block text-sm sm:text-base font-semibold text-gray-200 mb-3"
                        >
                          Specify Your State/Province *
                        </label>
                        <input
                          id="otherState"
                          type="text"
                          {...formik.getFieldProps('otherState')}
                          className="w-full px-4 py-3 bg-slate-700/60 border-2 border-blue-500/40 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 text-white placeholder-gray-400 text-base shadow-inner"
                          placeholder="Enter your state or province"
                        />
                        {formik.touched.otherState && formik.errors.otherState && (
                          <p className="text-red-400 text-sm mt-2 flex items-center gap-2 bg-red-500/10 px-3 py-2 rounded-lg border border-red-500/20">
                            <span className="w-1.5 h-1.5 bg-red-400 rounded-full"></span>
                            {formik.errors.otherState}
                          </p>
                        )}
                      </Box>
                    )}
                    {formik.touched.state && formik.errors.state && (
                      <p className="text-red-400 text-sm mt-2 flex items-center gap-2 bg-red-500/10 px-3 py-2 rounded-lg border border-red-500/20">
                        <span className="w-1.5 h-1.5 bg-red-400 rounded-full"></span>
                        {formik.errors.state}
                      </p>
                    )}
                  </Box>
                </Box>
              </Box>

              {/* Program Selection Section */}
              <Box className="space-y-4 sm:space-y-6">
                <Box className="flex items-center gap-3 sm:gap-4 mb-4 sm:mb-6">
                  <Box className="bg-blue-500/25 p-2 sm:p-3 rounded-xl border border-blue-400/40 shadow-lg">
                    <Users className="h-5 w-5 sm:h-6 sm:w-6 text-blue-400" />
                  </Box>
                  <h3 className="text-lg sm:text-xl md:text-2xl font-bold text-white">
                    Program Selection
                  </h3>
                </Box>

                {/* Track Select Dropdown */}
                <Box className="space-y-2">
                  <label
                    htmlFor="trackId"
                    className="block text-sm sm:text-base font-semibold text-gray-200"
                  >
                    Select Your Track *
                  </label>
                  <select
                    id="trackId"
                    {...formik.getFieldProps('trackId')}
                    className="w-full px-4 py-3 bg-slate-700/60 border-2 border-slate-600 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 text-white text-sm sm:text-base appearance-none backdrop-blur-sm shadow-inner"
                    onChange={e => {
                      formik.handleChange(e);
                      formik.setFieldValue('tools', []);
                    }}
                  >
                    <option value="" className="bg-slate-800">Select a track</option>
                    {tracks.map(track => (
                      <option key={track.id} value={track.id} className="bg-slate-800">
                        {track.name}
                      </option>
                    ))}
                  </select>
                  {formik.touched.trackId && formik.errors.trackId && (
                    <p className="text-red-400 text-sm mt-2 flex items-center gap-2 bg-red-500/10 px-3 py-2 rounded-lg border border-red-500/20">
                      <span className="w-1.5 h-1.5 bg-red-400 rounded-full"></span>
                      {formik.errors.trackId}
                    </p>
                  )}
                </Box>

                {/* Tools Checkboxes */}
                {formik.values.trackId && (
                  <Box className="space-y-2">
                    <label className="block text-sm sm:text-base font-semibold text-gray-200">
                      Select Related Tools *
                    </label>
                    <Box className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 mt-3">
                      {trackTools[formik.values.trackId]?.map(tool => (
                        <label
                          key={tool}
                          className="flex items-center gap-3 bg-slate-700/50 border-2 border-slate-600 rounded-lg px-4 py-3 cursor-pointer hover:bg-slate-600/50 transition-all duration-200 backdrop-blur-sm group hover:border-blue-500/30"
                        >
                          <input
                            type="checkbox"
                            name="tools"
                            value={tool}
                            checked={formik.values.tools.includes(tool)}
                            onChange={e => {
                              const { checked, value } = e.target;
                              if (checked) {
                                formik.setFieldValue('tools', [...formik.values.tools, value]);
                              } else {
                                formik.setFieldValue(
                                  'tools',
                                  formik.values.tools.filter(t => t !== value),
                                );
                              }
                            }}
                            className="h-4 w-4 text-blue-500 border-slate-400 rounded focus:ring-blue-500 bg-slate-600"
                          />
                          <span className="text-sm font-medium text-gray-200 group-hover:text-white">
                            {tool}
                          </span>
                        </label>
                      ))}
                    </Box>
                    {formik.touched.tools && formik.errors.tools && (
                      <p className="text-red-400 text-sm mt-2 flex items-center gap-2 bg-red-500/10 px-3 py-2 rounded-lg border border-red-500/20">
                        <span className="w-1.5 h-1.5 bg-red-400 rounded-full"></span>
                        {formik.errors.tools}
                      </p>
                    )}
                  </Box>
                )}
              </Box>

              {/* Motivation Section */}
              <Box className="space-y-4 sm:space-y-6">
                <Box className="flex items-center gap-3 sm:gap-4 mb-4 sm:mb-6">
                  <Box className="bg-blue-500/25 p-2 sm:p-3 rounded-xl border border-blue-400/40 shadow-lg">
                    <FileText className="h-5 w-5 sm:h-6 sm:w-6 text-blue-400" />
                  </Box>
                  <h3 className="text-lg sm:text-xl md:text-2xl font-bold text-white">
                    Motivation
                  </h3>
                </Box>

                <Box className="space-y-2">
                  <label
                    htmlFor="motivation"
                    className="block text-sm sm:text-base font-semibold text-gray-200"
                  >
                    Why do you want to join this program? *
                  </label>
                  <textarea
                    id="motivation"
                    rows={4}
                    {...formik.getFieldProps('motivation')}
                    className="w-full px-4 py-3 bg-slate-700/60 border-2 border-slate-600 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 text-white placeholder-gray-400 backdrop-blur-sm resize-none text-base shadow-inner hover:border-slate-500"
                    placeholder="Tell us why you want to join this program and advance your career in tech..."
                  />
                  {formik.touched.motivation && formik.errors.motivation && (
                    <p className="text-red-400 text-sm mt-2 flex items-center gap-2 bg-red-500/10 px-3 py-2 rounded-lg border border-red-500/20">
                      <span className="w-1.5 h-1.5 bg-red-400 rounded-full"></span>
                      {formik.errors.motivation}
                    </p>
                  )}
                </Box>
              </Box>

              {/* CV Upload Section */}
              <Box className="space-y-4 sm:space-y-6">
                <Box className="flex items-center gap-3 sm:gap-4 mb-4 sm:mb-6">
                  <Box className="bg-blue-500/25 p-2 sm:p-3 rounded-xl border border-blue-400/40 shadow-lg">
                    <FileText className="h-5 w-5 sm:h-6 sm:w-6 text-blue-400" />
                  </Box>
                  <h3 className="text-lg sm:text-xl md:text-2xl font-bold text-white">
                    Document Upload
                  </h3>
                </Box>

                <Box className="space-y-4">
                  {!formik.values.cv ? (
                    <Box className="border-2 border-dashed border-slate-600 rounded-xl p-6 sm:p-8 text-center bg-slate-700/30 backdrop-blur-sm hover:bg-slate-700/50 transition-all duration-200 hover:border-blue-400 group">
                      <input
                        type="file"
                        onChange={handleFileChange}
                        accept=".pdf"
                        className="hidden"
                        id="cv-upload"
                      />
                      <label htmlFor="cv-upload" className="cursor-pointer block">
                        <Upload className="mx-auto h-12 w-12 sm:h-16 sm:w-16 text-gray-400 group-hover:text-blue-400 transition-colors mb-4" />
                        <Box className="space-y-2">
                          <p className="text-blue-400 font-semibold text-lg sm:text-xl">
                            Upload your CV
                          </p>
                          <p className="text-gray-400 text-sm sm:text-base">
                            Drag and drop or click to browse
                          </p>
                          <p className="text-xs sm:text-sm text-gray-500">
                            PDF only up to 10MB
                          </p>
                        </Box>
                      </label>
                    </Box>
                  ) : (
                    <Box className="border-2 border-green-500/30 bg-gradient-to-r from-green-500/10 to-emerald-500/10 rounded-xl p-4 sm:p-6 shadow-sm backdrop-blur-sm">
                      <Box className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 sm:gap-6">
                        <Box className="flex items-center space-x-3 sm:space-x-4">
                          <FileText className="h-8 w-8 sm:h-12 sm:w-12 text-green-400" />
                          <Box>
                            <p className="font-semibold text-white text-base sm:text-lg truncate max-w-[200px] sm:max-w-none">
                              {formik.values.cv.name}
                            </p>
                            <p className="text-sm text-gray-300">
                              {(formik.values.cv.size / (1024 * 1024)).toFixed(2)} MB • Ready to submit
                            </p>
                          </Box>
                        </Box>
                        <Box className="flex items-center space-x-2 sm:space-x-3">
                          <button
                            type="button"
                            onClick={handleViewFile}
                            className="flex items-center space-x-2 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors shadow-sm backdrop-blur-sm text-sm font-medium"
                            title="View CV"
                          >
                            <Eye className="h-4 w-4" />
                            <span>View</span>
                          </button>
                          <button
                            type="button"
                            onClick={handleRemoveFile}
                            className="flex items-center space-x-2 px-4 py-2 bg-red-500/20 text-red-300 rounded-lg hover:bg-red-500/30 transition-colors backdrop-blur-sm border border-red-500/30 text-sm font-medium"
                            title="Remove CV"
                          >
                            <Trash2 className="h-4 w-4" />
                            <span>Delete</span>
                          </button>
                        </Box>
                      </Box>
                    </Box>
                  )}

                  {formik.touched.cv && formik.errors.cv && (
                    <p className="text-red-400 text-sm mt-2 flex items-center gap-2 bg-red-500/10 p-3 rounded-lg border border-red-500/20">
                      <span className="w-1.5 h-1.5 bg-red-400 rounded-full"></span>
                      {formik.errors.cv as string}
                    </p>
                  )}

                  {/* Upload Progress */}
                  {uploadProgress > 0 && (
                    <Box className="mt-4 p-4 bg-blue-500/10 rounded-xl border border-blue-500/20 backdrop-blur-sm">
                      <Box className="flex justify-between text-sm font-medium text-blue-300 mb-2">
                        <span>Uploading your CV...</span>
                        <span>{uploadProgress}%</span>
                      </Box>
                      <Box className="w-full bg-blue-500/20 rounded-full h-2">
                        <Box
                          className="bg-gradient-to-r from-blue-400 to-blue-500 h-2 rounded-full transition-all duration-300 shadow-sm"
                          style={{ width: `${uploadProgress}%` }}
                        />
                      </Box>
                    </Box>
                  )}
                </Box>
              </Box>

              {/* Referral Source Dropdown */}
              <Box className="space-y-2">
                <label
                  htmlFor="referralSource"
                  className="block text-sm sm:text-base font-semibold text-gray-200"
                >
                  How did you hear about us? *
                </label>
                <select
                  id="referralSource"
                  {...formik.getFieldProps('referralSource')}
                  className="w-full px-4 py-3 bg-slate-700/60 border-2 border-slate-600 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 text-white text-sm sm:text-base appearance-none backdrop-blur-sm shadow-inner"
                >
                  <option value="" className="bg-slate-800">Select a source</option>
                  {referralSources.map((source) => (
                    <option key={source} value={source} className="bg-slate-800">
                      {source}
                    </option>
                  ))}
                </select>
                {formik.touched.referralSource && formik.errors.referralSource && (
                  <p className="text-red-400 text-sm mt-2 flex items-center gap-2 bg-red-500/10 px-3 py-2 rounded-lg border border-red-500/20">
                    <span className="w-1.5 h-1.5 bg-red-400 rounded-full"></span>
                    {formik.errors.referralSource}
                  </p>
                )}
              </Box>

              {/* Enhanced Submit Button */}
              <Box className="pt-4 sm:pt-6">
                <button
                  type="submit"
                  disabled={isSubmitting || !formik.isValid || !formik.values.cohortNumber}
                  aria-label={isSubmitting ? 'Submitting application' : 'Submit application'}
                  className="w-full bg-gradient-to-r from-blue-500 to-blue-600 text-white py-4 px-6 rounded-xl font-bold text-lg hover:from-blue-600 hover:to-blue-700 focus:outline-none focus:ring-4 focus:ring-blue-500/30 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 backdrop-blur-sm border border-blue-400/30"
                >
                  {isSubmitting ? (
                    <Box className="flex items-center justify-center space-x-3">
                      <Loader2 className="h-5 w-5 sm:h-6 sm:w-6 animate-spin" />
                      <span className="text-base sm:text-lg">Submitting Application...</span>
                    </Box>
                  ) : (
                    <Box className="flex items-center justify-center space-x-3">
                      <CheckCircle2 className="h-5 w-5 sm:h-6 sm:w-6" />
                      <span className="text-base sm:text-lg">Submit Application</span>
                    </Box>
                  )}
                </button>
              </Box>
            </form>
          </Box>
        </Box>

        {/* Enhanced Success Modal */}
        {showSuccess && (
          <Box className="fixed inset-0 bg-black/80 backdrop-blur-lg flex items-center justify-center p-4 sm:p-6 z-50 animate-fade-in">
            <Box className="bg-slate-800/90 backdrop-blur-xl rounded-2xl sm:rounded-3xl p-6 sm:p-8 max-w-md w-full text-center shadow-2xl transform animate-scale-in border border-blue-500/20">
              <Box className="bg-gradient-to-r from-blue-400 to-blue-500 rounded-full w-12 h-12 sm:w-20 sm:h-20 flex items-center justify-center mx-auto mb-4 sm:mb-6 shadow-lg">
                <CheckCircle2 className="h-8 w-8 sm:h-10 sm:w-10 text-white" />
              </Box>
              <h3 className="text-xl sm:text-2xl font-bold text-white mb-3 sm:mb-4">
                Application Submitted!
              </h3>
              <p className="text-gray-300 text-sm sm:text-base mb-4 sm:mb-6 leading-relaxed">
                Thank you for your application to{' '}
                <span className="font-semibold text-blue-400">
                  Cohort {formik.values.cohortNumber}
                </span>
                . We've received your application and will review it carefully.
              </p>
              <Box className="w-full bg-gray-700 rounded-full h-2 mb-4 sm:mb-6">
                <Box className="bg-gradient-to-r from-blue-400 to-blue-500 h-2 rounded-full animate-pulse" />
              </Box>
              <button
                onClick={() => setShowSuccess(false)}
                className="w-full bg-blue-500 text-white py-3 px-4 rounded-xl font-semibold hover:bg-blue-600 transition-colors backdrop-blur-sm text-base sm:text-lg"
              >
                Close
              </button>
            </Box>
          </Box>
        )}
      </Box>
    </Box>
  );
}