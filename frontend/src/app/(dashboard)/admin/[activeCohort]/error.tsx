'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { MessageSquareWarning } from 'lucide-react';

interface ErrorProps {
  error: Error & { digest?: string };
  reset: () => void;
}

export default function Error({ error, reset }: ErrorProps) {
  const router = useRouter();

  const handleReset = () => {
    reset();
  };

  const handleGoBack = () => {
    router.back();
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <div className="max-w-lg w-full  rounded-xl  p-8 text-center">
        {/* Error Icon */}
        <div className="w-20 h-20 mx-auto mb-6 bg-red-100 rounded-full flex items-center justify-center">
          <MessageSquareWarning className="text-red-500" />
        </div>

        {/* Error Title */}
        <h1 className="text-2xl font-bold text-gray-900 mb-3">Something went wrong!</h1>

        {/* Error Message */}
        <div className="mb-6">
          <p className="text-gray-600 mb-2">We encountered an unexpected error.</p>
          <details className="text-sm text-gray-500 bg-gray-50 rounded-lg p-3">
            <summary className="cursor-pointer font-medium">Error details</summary>
            <p className="mt-2 text-center break-words">{error.message}</p>
            {error.digest && <p className="mt-1 text-xs text-gray-400">Error ID: {error.digest}</p>}
          </details>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <button
            onClick={handleReset}
            className="px-6 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-600 focus:ring-offset-2 transition-colors font-medium cursor-pointer"
          >
            Try Again
          </button>

          <button
            onClick={handleGoBack}
            className="px-6 py-3 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 focus:outline-none focus:ring-2 focus:ring-gray-400 focus:ring-offset-2 transition-colors font-medium cursor-pointer"
          >
            Go Back
          </button>
        </div>

        {/* Help Text */}
        <p className="text-sm text-gray-500 mt-6">If this continues, please contact support.</p>
      </div>
    </div>
  );
}
