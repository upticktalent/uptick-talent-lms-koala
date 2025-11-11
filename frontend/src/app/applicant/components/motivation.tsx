'use client';

import { FileText } from 'lucide-react';
import Box from '@/components/ui/box';
import { FormikProps } from 'formik';
import { ApplicationFormValues } from '../types/type';

interface MotivationSectionProps {
  formik: FormikProps<ApplicationFormValues>;
}

export default function MotivationSection({ formik }: MotivationSectionProps) {
  return (
    <Box className="space-y-4 sm:space-y-6">
      {/* Section Title */}
      <Box className="flex items-center gap-3 sm:gap-4 mb-4 sm:mb-6">
        <Box className="bg-blue-500/25 p-2 sm:p-3 rounded-xl border border-blue-400/40 shadow-lg">
          <FileText className="h-5 w-5 sm:h-6 sm:w-6 text-blue-400" />
        </Box>
        <Box as="h3" className="text-lg sm:text-xl md:text-2xl font-bold text-white">
          Motivation
        </Box>
      </Box>

      <Box className="space-y-2">
        <Box as="label" htmlFor="motivation" className="block text-sm sm:text-base font-semibold text-gray-200">
          Why do you want to join this program? *
        </Box>
        <Box
          as="textarea"
          id="motivation"
          rows={4}
          {...formik.getFieldProps('motivation')}
          className="w-full px-4 py-3 bg-slate-700/60 border-2 border-slate-600 rounded-xl 
            focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 
            text-white placeholder-gray-400 backdrop-blur-sm resize-none text-base shadow-inner hover:border-slate-500"
          placeholder="Tell us why you want to join this program and advance your career in tech..."
        />
        {formik.touched.motivation && formik.errors.motivation && (
          <Box className="text-red-400 text-sm mt-2 flex items-center gap-2 bg-red-500/10 px-3 py-2 rounded-lg border border-red-500/20">
            <Box className="w-1.5 h-1.5 bg-red-400 rounded-full" />
            {formik.errors.motivation}
          </Box>
        )}
      </Box>
    </Box>
  );
}
