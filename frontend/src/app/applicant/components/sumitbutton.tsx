'use client';

import { FormikProps } from 'formik';
import { ApplicationFormValues } from '../types/type';
import Box from '@/components/ui/box';
import { CheckCircle2, Loader2 } from 'lucide-react';

interface SubmitButtonProps {
  isSubmitting: boolean;
  formik: FormikProps<ApplicationFormValues>;
  isCohortLoading?: boolean;
}

export default function SubmitButton({ isSubmitting, formik, isCohortLoading = false }: SubmitButtonProps) {

  const isDisabled = isSubmitting || !formik.isValid || isCohortLoading;

  return (
    <Box className="pt-4 sm:pt-6">
      <button
        type="submit"
        disabled={isDisabled}
        className="w-full bg-gradient-to-r from-blue-500 to-blue-600 text-white py-4 px-6 rounded-xl font-bold text-lg hover:from-blue-600 hover:to-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 backdrop-blur-sm border border-blue-400/30"
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
  );
}