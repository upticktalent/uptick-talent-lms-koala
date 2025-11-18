'use client';

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useFormik } from 'formik';
import { toast } from 'sonner';
import Image from 'next/image';
import Box from '@/components/ui/box';
import logo from '../../../public/upticklogo.svg';
import {
  PersonalInfoSection,
  ContactSection,
  LocationSection,
  TrackSection,
  MotivationSection,
  FileUploadSection,
  ReferralSection,
  SubmitButton,
  SuccessModal
} from '.';
import { baseUrl, validationSchema } from './constants/constants';
import { ApplicationFormValues, initialValues } from './types/type';

const fetchCohortData = async () => {
  const response = await fetch(`${baseUrl}/api/cohorts/current-active`, {
    headers: {
      Authorization: `Bearer ______Up@TickLMS____TOKEN___`,
    },
  });
  if (!response.ok) {
    throw new Error(`Failed to fetch cohort data: ${response.status}`);
  }
  return response.json();
};

const submitApplication = async (formData: FormData) => {
  const response = await fetch(`${baseUrl}/api/applications/apply`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ______Up@TickLMS____TOKEN___`,
    },
    body: formData,
  });
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || 'Application submission failed');
  }

  return response.json();
};

export default function ApplicationForm() {
      const queryClient = useQueryClient();
  const [showSuccess, setShowSuccess] = useState(false);

  const { 
    data: cohortData, 
    isLoading: isCohortLoading, 
    error: cohortError,
    isError: isCohortError 
  } = useQuery({
    queryKey: ['current-cohort'],
    queryFn: fetchCohortData,
    staleTime: 1000 * 60 * 5, // 5 minutes
    retry: 2,
  });

  const { mutate: applyMutation, isPending: isSubmitting } = useMutation({
    mutationFn: submitApplication,
    onSuccess: () => {
      toast.success('Application submitted successfully!');
      setShowSuccess(true);
      queryClient.invalidateQueries({ queryKey: ['current-cohort'] });
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Submission failed');
    },
  });

  const formik = useFormik<ApplicationFormValues>({
    initialValues,
    validationSchema,
    validateOnMount: false,
    validateOnChange: true,
    validateOnBlur: true,
    onSubmit: (values) => {
      const finalCohortNumber = values.cohortNumber || cohortData?.data?.cohortNumber;
      
      if (!finalCohortNumber) {
        toast.error('No active cohort found');
        return;
      }
      const finalCountry = values.country === 'Other' ? values.otherCountry : values.country;
      const finalState = values.state === 'Other' ? values.otherState : values.state;

      const formData = new FormData();

      formData.append('firstName', values.firstName);
      formData.append('lastName', values.lastName);
      formData.append('email', values.email);
      formData.append('phoneNumber', values.phoneNumber);
      formData.append('gender', values.gender);
      formData.append('country', finalCountry);
      formData.append('state', finalState);
      formData.append('trackId', values.trackId);
      formData.append('cohortNumber', finalCohortNumber);
      formData.append('referralSource', values.referralSource);
      formData.append('motivation', values.motivation);

      if (values.tools?.length > 0) {
        values.tools.forEach((tool) => formData.append('tools', tool));
      }

      if (values.cv) {
        formData.append('cv', values.cv);
      }

      applyMutation(formData);
    },
  });

  if (isCohortError && cohortError) {
    toast.error('Failed to load cohort data. Please refresh the page.');
  }

  return (
    <Box className="min-h-screen py-6 sm:py-8 px-4 sm:px-6">
      <Box className="max-w-4xl mx-auto">
        <Box className="bg-slate-900 rounded-2xl shadow-2xl border border-blue-500/20 overflow-hidden">
          <Box className="bg-blue-800 p-6 md:p-8 relative overflow-hidden">
            <Box className="absolute inset-0 bg-black/20" />
            <Box className="relative z-10 flex flex-row justify-between items-center">
              <Box className="flex items-center gap-4">
                <Box className="bg-white/15 backdrop-blur-md rounded-xl p-3 border border-white/25 shadow-lg">
                  <Box className="relative w-32 sm:w-40 h-8 sm:h-10">
                    <Image
                      src={logo}
                      alt="Uptick Logo"
                      fill
                      priority
                      className="object-contain"
                    />
                  </Box>
                </Box>
              </Box>
              <Box className="bg-white/20 backdrop-blur-md rounded-xl px-4 py-2 text-center border border-white/25 shadow-lg">
                <p className="text-sm sm:text-lg font-bold text-white">
                  {isCohortLoading
                    ? 'Loading...'
                    : cohortData?.data?.cohortNumber
                      ? `Cohort ${cohortData.data.cohortNumber}`
                      : 'No Active Cohort'}
                </p>
              </Box>
            </Box>
          </Box>

          <Box className="p-6 sm:p-8">
            <form onSubmit={formik.handleSubmit} className="space-y-8" noValidate>
              <PersonalInfoSection formik={formik} />
              <ContactSection formik={formik} />
              <LocationSection formik={formik} />
              
              <TrackSection formik={formik} />
              
              <MotivationSection formik={formik} />
              <FileUploadSection
                formik={formik}
                onFileChange={(file) => formik.setFieldValue('cv', file)}
                onRemoveFile={() => formik.setFieldValue('cv', null)}
              />
              <ReferralSection formik={formik} />
              
              <SubmitButton 
                isSubmitting={isSubmitting} 
                formik={formik} 
                isCohortLoading={isCohortLoading}
              />
            </form>
          </Box>
        </Box>
      </Box>

      {showSuccess && (
        <SuccessModal
          cohortNumber={formik.values.cohortNumber || cohortData?.data?.cohortNumber}
          onClose={() => setShowSuccess(false)}
        />
      )}
    </Box>
  );
}
