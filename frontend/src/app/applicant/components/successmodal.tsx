'use client';

import Box from '@/components/ui/box';
import { CheckCircle2 } from "lucide-react";

interface SuccessModalProps {
  cohortNumber: string;
  onClose: () => void;
}

export default function SuccessModal({ cohortNumber, onClose }: SuccessModalProps) {
  return (
    <Box className="fixed inset-0 bg-black/80 backdrop-blur-lg flex items-center justify-center p-4 sm:p-6 z-50 animate-fade-in">
      <Box className="bg-slate-800/90 backdrop-blur-xl rounded-2xl sm:rounded-3xl p-6 sm:p-8 max-w-md w-full text-center shadow-2xl transform animate-scale-in border border-blue-500/20">
        <Box className="bg-gradient-to-r from-blue-400 to-blue-500 rounded-full w-12 h-12 sm:w-20 sm:h-20 flex items-center justify-center mx-auto mb-4 sm:mb-6 shadow-lg">
          <CheckCircle2 className="h-8 w-8 sm:h-10 sm:w-10 text-white" />
        </Box>
        <Box as="h3" className="text-xl sm:text-2xl font-bold text-white mb-3 sm:mb-4">
          Application Submitted!
        </Box>
        <Box as="p" className="text-gray-300 text-sm sm:text-base mb-4 sm:mb-6 leading-relaxed">
          Thank you for your application to{' '}
          <Box as="span" className="font-semibold text-blue-400">
            Cohort {cohortNumber}
          </Box>
          . We&apos;ve received your application and will review it carefully.
        </Box>
        <Box className="w-full bg-gray-700 rounded-full h-2 mb-4 sm:mb-6">
          <Box className="bg-gradient-to-r from-blue-400 to-blue-500 h-2 rounded-full animate-pulse" />
        </Box>
        <button
          onClick={onClose}
          className="w-full bg-blue-500 text-white py-3 px-4 rounded-xl font-semibold hover:bg-blue-600 transition-colors backdrop-blur-sm text-base sm:text-lg"
        >
          Close
        </button>
      </Box>
    </Box>
  );
}