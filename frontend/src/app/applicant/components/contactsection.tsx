'use client';

import React from 'react';
import { Mail, Phone } from 'lucide-react';
import Box from '@/components/ui/box';
import { FormikProps } from 'formik';
import { ApplicationFormValues } from '../types/type';

interface ContactSectionProps {
  formik: FormikProps<ApplicationFormValues>;
}

const ContactSection: React.FC<ContactSectionProps> = ({ formik }) => {
  return (
    <Box className="space-y-4 sm:space-y-6">
      <Box className="flex items-center gap-3 sm:gap-4 mb-4 sm:mb-6">
        <Box className="bg-blue-500/25 p-2 sm:p-3 rounded-xl border border-blue-400/40 shadow-lg">
          <Mail className="h-5 w-5 sm:h-6 sm:w-6 text-blue-400" />
        </Box>
        <Box as="h3" className="text-lg sm:text-xl md:text-2xl font-bold text-white">
          Contact Information
        </Box>
      </Box>

      <Box className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
        <Box className="space-y-2">
          <Box as="label" htmlFor="email" className="block text-sm sm:text-base font-semibold text-gray-200">
            Email Address *
          </Box>
          <Box className="relative">
            <Mail className="absolute left-4 top-1/2 transform -translate-y-1/2 h-4 w-4 sm:h-5 sm:w-5 text-gray-400" />
            <Box
              as="input"
              id="email"
              type="email"
              {...formik.getFieldProps('email')}
              className="w-full pl-12 pr-4 py-3 bg-slate-700/60 border-2 border-slate-600 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 text-white placeholder-gray-400 backdrop-blur-sm text-base shadow-inner hover:border-slate-500"
              placeholder="your.email@example.com"
            />
          </Box>
          {formik.touched.email && formik.errors.email && (
            <Box className="text-red-400 text-sm mt-2 flex items-center gap-2 bg-red-500/10 px-3 py-2 rounded-lg border border-red-500/20">
              <Box className="w-1.5 h-1.5 bg-red-400 rounded-full" />
              {formik.errors.email}
            </Box>
          )}
        </Box>

        <Box className="space-y-2">
          <Box as="label" htmlFor="phoneNumber" className="block text-sm sm:text-base font-semibold text-gray-200">
            Phone Number *
          </Box>
          <Box className="relative">
            <Phone className="absolute left-4 top-1/2 transform -translate-y-1/2 h-4 w-4 sm:h-5 sm:w-5 text-gray-400" />
            <Box
              as="input"
              id="phoneNumber"
              type="tel"
              {...formik.getFieldProps('phoneNumber')}
              className="w-full pl-12 pr-4 py-3 bg-slate-700/60 border-2 border-slate-600 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 text-white placeholder-gray-400 backdrop-blur-sm text-base shadow-inner hover:border-slate-500"
              placeholder="+1234567890"
            />
          </Box>
          {formik.touched.phoneNumber && formik.errors.phoneNumber && (
            <Box className="text-red-400 text-sm mt-2 flex items-center gap-2 bg-red-500/10 px-3 py-2 rounded-lg border border-red-500/20">
              <Box className="w-1.5 h-1.5 bg-red-400 rounded-full" />
              {formik.errors.phoneNumber}
            </Box>
          )}
        </Box>
      </Box>
    </Box>
  );
};

export default ContactSection;