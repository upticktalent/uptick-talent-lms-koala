'use client';

import React from 'react';
import Box from '@/components/ui/box';
import { FormikProps } from 'formik';
import { ApplicationFormValues } from '../types/type';
import { referralSources } from '../constants/constants';

interface ReferralSectionProps {
  formik: FormikProps<ApplicationFormValues>;
}

const ReferralSection: React.FC<ReferralSectionProps> = ({ formik }) => {
  return (
    <Box className="space-y-4 sm:space-y-6">
      <Box className="flex items-center gap-3 sm:gap-4 mb-4 sm:mb-6">
        <Box className="bg-blue-500/25 p-2 sm:p-3 rounded-xl border border-blue-400/40 shadow-lg">
          <Box as="span" className="text-blue-400 font-bold text-base sm:text-lg">#</Box>
        </Box>
        <Box as="h3" className="text-lg sm:text-xl md:text-2xl font-bold text-white">
          Referral Source
        </Box>
      </Box>

      <Box className="space-y-2">
        <Box
          as="label"
          htmlFor="referralSource"
          className="block text-sm sm:text-base font-semibold text-gray-200"
        >
          How did you hear about us? *
        </Box>
        <Box
          as="select"
          id="referralSource"
          {...formik.getFieldProps('referralSource')}
          className="w-full px-4 py-3 bg-slate-700/60 border-2 border-slate-600 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 text-white text-sm sm:text-base backdrop-blur-sm shadow-inner hover:border-slate-500"
        >
          <Box as="option" value="" className="bg-slate-800">Select a source</Box>
          {referralSources.map((source: string) => (
            <Box as="option" key={source} value={source} className="bg-slate-800">
              {source}
            </Box>
          ))}
        </Box>
        {formik.touched.referralSource && formik.errors.referralSource && (
          <Box className="text-red-400 text-sm mt-2 flex items-center gap-2 bg-red-500/10 px-3 py-2 rounded-lg border border-red-500/20">
            <Box className="w-1.5 h-1.5 bg-red-400 rounded-full" />
            {formik.errors.referralSource}
          </Box>
        )}
      </Box>
    </Box>
  );
};

export default ReferralSection;