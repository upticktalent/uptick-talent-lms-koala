'use client';

import { User } from 'lucide-react';
import Box from '@/components/ui/box';
import { FormikProps } from 'formik';
import { ApplicationFormValues } from '../types/type';

interface PersonalInfoSectionProps {
  formik: FormikProps<ApplicationFormValues>;
}

export default function PersonalInfoSection({ formik }: PersonalInfoSectionProps) {
  return (
    <Box className="space-y-4 sm:space-y-6">
      <Box className="flex items-center gap-3 sm:gap-4 mb-4 sm:mb-6">
        <Box className="bg-blue-500/25 p-2 sm:p-3 rounded-xl border border-blue-400/40 shadow-lg">
          <User className="h-5 w-5 sm:h-6 sm:w-6 text-blue-400" />
        </Box>
        <Box as="h3" className="text-lg sm:text-xl md:text-2xl font-bold text-white">
          Personal Information
        </Box>
      </Box>

      <Box className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
        <Box className="space-y-2">
          <Box as="label" htmlFor="firstName" className="block text-sm sm:text-base font-semibold text-gray-200">
            First Name *
          </Box>
          <Box
            as="input"
            id="firstName"
            type="text"
            {...formik.getFieldProps('firstName')}
            className="w-full px-4 py-3 bg-slate-700/60 border-2 border-slate-600 rounded-xl 
            focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 
            text-white placeholder-gray-400 backdrop-blur-sm text-base shadow-inner hover:border-slate-500"
            placeholder="Enter your first name"
          />
          {formik.touched.firstName && formik.errors.firstName && (
            <Box className="text-red-400 text-sm mt-2 flex items-center gap-2 bg-red-500/10 px-3 py-2 rounded-lg border border-red-500/20">
              <Box className="w-1.5 h-1.5 bg-red-400 rounded-full"></Box>
              {formik.errors.firstName}
            </Box>
          )}
        </Box>

        <Box className="space-y-2">
          <Box as="label" htmlFor="lastName" className="block text-sm sm:text-base font-semibold text-gray-200">
            Last Name *
          </Box>
          <Box
            as="input"
            id="lastName"
            type="text"
            {...formik.getFieldProps('lastName')}
            className="w-full px-4 py-3 bg-slate-700/60 border-2 border-slate-600 rounded-xl 
            focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 
            text-white placeholder-gray-400 backdrop-blur-sm text-base shadow-inner hover:border-slate-500"
            placeholder="Enter your last name"
          />
          {formik.touched.lastName && formik.errors.lastName && (
            <Box className="text-red-400 text-sm mt-2 flex items-center gap-2 bg-red-500/10 px-3 py-2 rounded-lg border border-red-500/20">
              <Box className="w-1.5 h-1.5 bg-red-400 rounded-full"></Box>
              {formik.errors.lastName}
            </Box>
          )}
        </Box>
      </Box>
    </Box>
  );
}
