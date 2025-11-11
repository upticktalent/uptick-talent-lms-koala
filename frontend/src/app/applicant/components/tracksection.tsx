'use client';

import React, { useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import Box from '@/components/ui/box';
import { FormikProps } from 'formik';
import { ApplicationFormValues, Track } from '../types/type';
import { trackTools, baseUrl, trackNameToIdMap } from '../constants/constants';

interface TrackSectionProps {
  formik: FormikProps<ApplicationFormValues>;
}

const fetchCurrentCohort = async () => {
  const response = await fetch(`${baseUrl}/api/cohorts/current-active`, {
    headers: {
      'Authorization': `Bearer ______Up@TickLMS____TOKEN___`,
      'Content-Type': 'application/json',
    },
  });
  
  if (!response.ok) {
    throw new Error(`Failed to fetch cohort data: ${response.status}`);
  }
  
  const data = await response.json();
  return data;
};

const TrackSection: React.FC<TrackSectionProps> = ({ formik }) => {
  const { 
    data: cohortData, 
    isLoading, 
    isError 
  } = useQuery({
    queryKey: ['current-cohort'],
    queryFn: fetchCurrentCohort,
    staleTime: 5 * 60 * 1000,
    retry: 1,
  });

  const tracks: (Track & { slug: string })[] = (cohortData?.data?.tracks || []).map((track: Track) => ({
    ...track,
    slug: trackNameToIdMap[track.name] || track.name.toLowerCase().replace(/\s+/g, '-')
  }));

  const trackIdToTools = useMemo(() => {
    const mapping: Record<string, string[]> = {};
    
    if (Array.isArray(tracks)) {
      tracks.forEach((track: Track & { slug: string }) => {
        if (track && track.slug && track.name) {
          mapping[track.slug] = trackTools[track.slug] || [];
        }
      });
    }
    
    return mapping;
  }, [tracks]); 

  if (isLoading) {
    return (
      <Box className="space-y-4 sm:space-y-6">
        <Box className="flex items-center gap-3 sm:gap-4 mb-4 sm:mb-6">
          <Box className="bg-blue-500/25 p-2 sm:p-3 rounded-xl border border-blue-400/40 shadow-lg">
            <Box className="h-5 w-5 sm:h-6 sm:w-6 bg-blue-400 rounded-full" />
          </Box>
          <Box as="h3" className="text-lg sm:text-xl md:text-2xl font-bold text-white">
            Program Selection
          </Box>
        </Box>
        
        <Box className="space-y-2">
          <Box as="label" className="block text-sm sm:text-base font-semibold text-gray-200">
            Select Your Track *
          </Box>
          <Box className="w-full px-4 py-3 bg-slate-700/60 border-2 border-slate-600 rounded-xl text-white text-sm sm:text-base backdrop-blur-sm shadow-inner animate-pulse">
            Loading available programs...
          </Box>
        </Box>
      </Box>
    );
  }

  if (isError) {
    return (
      <Box className="space-y-4 sm:space-y-6">
        <Box className="flex items-center gap-3 sm:gap-4 mb-4 sm:mb-6">
          <Box className="bg-red-500/25 p-2 sm:p-3 rounded-xl border border-red-400/40 shadow-lg">
            <Box className="h-5 w-5 sm:h-6 sm:w-6 bg-red-400 rounded-full" />
          </Box>
          <Box as="h3" className="text-lg sm:text-xl md:text-2xl font-bold text-white">
            Program Selection
          </Box>
        </Box>
        
        <Box className="space-y-2">
          <Box as="label" className="block text-sm sm:text-base font-semibold text-gray-200">
            Select Your Track *
          </Box>
          <Box className="w-full px-4 py-3 bg-red-500/10 border-2 border-red-500/20 rounded-xl text-red-400 text-sm sm:text-base backdrop-blur-sm shadow-inner text-center">
            Unable to load programs at this time
          </Box>
          <Box className="text-red-400 text-sm flex items-center gap-2 bg-red-500/10 px-3 py-2 rounded-lg border border-red-500/20">
            <Box className="w-1.5 h-1.5 bg-red-400 rounded-full" />
            Please check your internet connection and try again
          </Box>
        </Box>
      </Box>
    );
  }

  if (!Array.isArray(tracks) || tracks.length === 0) {
    return (
      <Box className="space-y-4 sm:space-y-6">
        <Box className="flex items-center gap-3 sm:gap-4 mb-4 sm:mb-6">
          <Box className="bg-yellow-500/25 p-2 sm:p-3 rounded-xl border border-yellow-400/40 shadow-lg">
            <Box className="h-5 w-5 sm:h-6 sm:w-6 bg-yellow-400 rounded-full" />
          </Box>
          <Box as="h3" className="text-lg sm:text-xl md:text-2xl font-bold text-white">
            Program Selection
          </Box>
        </Box>
        
        <Box className="space-y-2">
          <Box as="label" className="block text-sm sm:text-base font-semibold text-gray-200">
            Select Your Track *
          </Box>
          <Box className="w-full px-4 py-3 bg-yellow-500/10 border-2 border-yellow-500/20 rounded-xl text-yellow-400 text-sm sm:text-base backdrop-blur-sm shadow-inner text-center">
            No programs currently available
          </Box>
          <Box className="text-yellow-400 text-sm flex items-center gap-2 bg-yellow-500/10 px-3 py-2 rounded-lg border border-yellow-500/20">
            <Box className="w-1.5 h-1.5 bg-yellow-400 rounded-full" />
            New programs will be available soon. Please check back later.
          </Box>
        </Box>
      </Box>
    );
  }

  return (
    <Box className="space-y-4 sm:space-y-6">
      <Box className="flex items-center gap-3 sm:gap-4 mb-4 sm:mb-6">
        <Box className="bg-blue-500/25 p-2 sm:p-3 rounded-xl border border-blue-400/40 shadow-lg">
          <Box className="h-5 w-5 sm:h-6 sm:w-6 bg-blue-400 rounded-full" />
        </Box>
        <Box as="h3" className="text-lg sm:text-xl md:text-2xl font-bold text-white">
          Program Selection
        </Box>
      </Box>

      <Box className="space-y-2">
        <Box as="label" htmlFor="trackId" className="block text-sm sm:text-base font-semibold text-gray-200">
          Select Your Track *
        </Box>
        <Box
          as="select"
          id="trackId"
          {...formik.getFieldProps('trackId')}
          className="w-full px-4 py-3 bg-slate-700/60 border-2 border-slate-600 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 text-white text-sm sm:text-base appearance-none backdrop-blur-sm shadow-inner"
          onChange={(e) => {
            formik.handleChange(e);
            formik.setFieldValue('tools', []); 
          }}
        >
          <option value="" className="bg-slate-800">Select a track</option>
          {tracks.map((track: Track & { slug: string }) => (
            <option key={track._id} value={track.slug} className="bg-slate-800">
              {track.name}
            </option>
          ))}
        </Box>

        {formik.touched.trackId && formik.errors.trackId && (
          <Box className="text-red-400 text-sm mt-2 flex items-center gap-2 bg-red-500/10 px-3 py-2 rounded-lg border border-red-500/20">
            <Box className="w-1.5 h-1.5 bg-red-400 rounded-full" />
            Please select a program track
          </Box>
        )}
      </Box>

      {formik.values.trackId && (
        <Box className="space-y-2">
          <Box className="block text-sm sm:text-base font-semibold text-gray-200">
            Select Related Tools *
          </Box>
          <Box className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 mt-3">
            {(trackIdToTools[formik.values.trackId] || []).map((tool: string) => (
              <Box
                as="label"
                key={tool}
                className="flex items-center gap-3 bg-slate-700/50 border-2 border-slate-600 rounded-lg px-4 py-3 cursor-pointer hover:bg-slate-600/50 transition-all duration-200 backdrop-blur-sm group hover:border-blue-500/30"
              >
                <Box
                  as="input"
                  type="checkbox"
                  name="tools"
                  value={tool}
                  checked={formik.values.tools.includes(tool)}
                  onChange={(e) => {
                    const { checked, value } = e.target;
                    if (checked) {
                      formik.setFieldValue('tools', [...formik.values.tools, value]);
                    } else {
                      formik.setFieldValue('tools', formik.values.tools.filter(t => t !== value));
                    }
                  }}
                  className="h-4 w-4 text-blue-500 border-slate-400 rounded focus:ring-blue-500 bg-slate-600"
                />
                <Box as="span" className="text-sm font-medium text-gray-200 group-hover:text-white">
                  {tool}
                </Box>
              </Box>
            ))}
          </Box>

          {formik.touched.tools && formik.errors.tools && (
            <Box className="text-red-400 text-sm mt-2 flex items-center gap-2 bg-red-500/10 px-3 py-2 rounded-lg border border-red-500/20">
              <Box className="w-1.5 h-1.5 bg-red-400 rounded-full" />
              Please select at least one tool you&apos;re familiar with
            </Box>
          )}
        </Box>
      )}
    </Box>
  );
};

export default TrackSection;