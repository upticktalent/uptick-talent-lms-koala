'use client';

import React from 'react';
import { Globe } from 'lucide-react';
import Box from '@/components/ui/box';
import { FormikProps } from 'formik';
import { ApplicationFormValues } from '../types/type';
import { countries, statesByCountry } from '../constants/constants';

interface LocationSectionProps {
  formik: FormikProps<ApplicationFormValues>;
}

const LocationSection: React.FC<LocationSectionProps> = ({ formik }) => {
  return (
    <Box className="space-y-4 sm:space-y-6">
      <Box className="flex items-center gap-3 sm:gap-4 mb-4 sm:mb-6">
        <Box className="bg-blue-500/25 p-2 sm:p-3 rounded-xl border border-blue-400/40 shadow-lg">
          <Globe className="h-5 w-5 sm:h-6 sm:w-6 text-blue-400" />
        </Box>
        <Box as="h3" className="text-lg sm:text-xl md:text-2xl font-bold text-white">
          Location & Gender
        </Box>
      </Box>

      <Box className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
        <Box className="space-y-2">
          <Box as="label" htmlFor="gender" className="block text-sm sm:text-base font-semibold text-gray-200">
            Gender *
          </Box>
          <Box as="select" id="gender" {...formik.getFieldProps('gender')} className="w-full px-4 py-3 bg-slate-700/60 border-2 border-slate-600 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 text-white text-sm sm:text-base appearance-none backdrop-blur-sm shadow-inner">
            <option className='bg-slate-800' value="">Select gender</option>
            {['male', 'female', 'other'].map((gender) => (
              <option className='bg-slate-800' key={gender} value={gender}>{gender}</option>
            ))}
          </Box>
          {formik.touched.gender && formik.errors.gender && (
            <Box className="text-red-400 text-sm mt-2">{formik.errors.gender}</Box>
          )}
        </Box>

        <Box className="space-y-2">
          <Box as="label" htmlFor="country" className="block text-sm sm:text-base font-semibold text-gray-200">
            Country *
          </Box>
          <Box as="select" id="country" {...formik.getFieldProps('country')} className="w-full px-4 py-3 bg-slate-700/60 border-2 border-slate-600 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 text-white text-sm sm:text-base appearance-none backdrop-blur-sm shadow-inner">
            <option className='bg-slate-800' value="">Select Country</option>
            {countries.map((country) => (
              <option className='bg-slate-800' key={country} value={country}>{country}</option>
            ))}
          </Box>
          {formik.touched.country && formik.errors.country && (
            <Box className="text-red-400 text-sm mt-2">{formik.errors.country}</Box>
          )}

          {formik.values.country === 'Other' && (
            <Box className="mt-4 p-4 bg-blue-500/15 rounded-xl border-2 border-blue-500/30">
              <Box as="label" htmlFor="otherCountry" className="block text-sm sm:text-base font-semibold text-gray-200 mb-3">
                Specify Your Country *
              </Box>
              <Box as="input" id="otherCountry" type="text" {...formik.getFieldProps('otherCountry')} placeholder="Enter your country name" className="w-full px-4 py-3 bg-slate-700/60 border-2 border-blue-500/40 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 text-white placeholder-gray-400 text-base shadow-inner"/>
              {formik.touched.otherCountry && formik.errors.otherCountry && (
                <Box className="text-red-400 text-sm mt-2">{formik.errors.otherCountry}</Box>
              )}
            </Box>
          )}
        </Box>

        <Box className="space-y-2">
          <Box as="label" htmlFor="state" className="block text-sm sm:text-base font-semibold text-gray-200">
            State/Province *
          </Box>
          {formik.values.country && formik.values.country !== 'Other' ? (
            <Box as="select" id="state" {...formik.getFieldProps('state')} className="w-full px-4 py-3 bg-slate-700/60 border-2 border-slate-600 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 text-white text-sm sm:text-base appearance-none backdrop-blur-sm shadow-inner">
              <option className='bg-slate-800' value="">Select State/Province</option>
              {statesByCountry[formik.values.country]?.map((state) => (
                <option className='bg-slate-800' key={state} value={state}>{state}</option>
              ))}
            </Box>
          ) : (
            <Box as="input" id="state" type="text" {...formik.getFieldProps('state')} placeholder="Enter your state or province" className="w-full px-4 py-3 bg-slate-700/60 border-2 border-slate-600 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 text-white placeholder-gray-400 backdrop-blur-sm text-base shadow-inner"/>
          )}
          {formik.touched.state && formik.errors.state && (
            <Box className="text-red-400 text-sm mt-2">{formik.errors.state}</Box>
          )}

          {formik.values.state === 'Other' && (
            <Box className="mt-4 p-4 bg-blue-500/15 rounded-xl border-2 border-blue-500/30">
              <Box as="label" htmlFor="otherState" className="block text-sm sm:text-base font-semibold text-gray-200 mb-3">
                Specify Your State/Province *
              </Box>
              <Box as="input" id="otherState" type="text" {...formik.getFieldProps('otherState')} placeholder="Enter your state or province" className="w-full px-4 py-3 bg-slate-700/60 border-2 border-blue-500/40 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 text-white placeholder-gray-400 text-base shadow-inner"/>
              {formik.touched.otherState && formik.errors.otherState && (
                <Box className="text-red-400 text-sm mt-2">{formik.errors.otherState}</Box>
              )}
            </Box>
          )}
        </Box>
      </Box>
    </Box>
  );
};

export default LocationSection;
