'use client';


import React from 'react';
import Box from '@/components/ui/box';
import { FormikProps } from 'formik';
import { ApplicationFormValues } from '../types/type';
import { Upload, Trash2 } from 'lucide-react';

interface FileUploadSectionProps {
  formik: FormikProps<ApplicationFormValues>;
  onFileChange: (file: File | null) => void;
  onRemoveFile: () => void;
}

const FileUploadSection: React.FC<FileUploadSectionProps> = ({
  formik,
  onFileChange,
  onRemoveFile,
}) => {
  const handleViewFile = () => {
    if (formik.values.cv) {
      const fileURL = URL.createObjectURL(formik.values.cv);
      window.open(fileURL, '_blank', 'noopener,noreferrer');
      setTimeout(() => URL.revokeObjectURL(fileURL), 10000);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files ? e.target.files[0] : null;
    onFileChange(file);
    formik.setFieldValue('cv', file);
    formik.validateField('cv'); 
  };

  const handleRemoveFile = () => {
    onRemoveFile();
    formik.setFieldValue('cv', null);
    formik.validateField('cv'); 
  };

  return (
    <Box className="space-y-4 sm:space-y-6">
      {/* Header */}
      <Box className="flex items-center gap-3 sm:gap-4 mb-4 sm:mb-6">
        <Box className="bg-blue-500/25 p-2 sm:p-3 rounded-xl border border-blue-400/40 shadow-lg">
          <Upload className="h-5 w-5 sm:h-6 sm:w-6 text-blue-400" />
        </Box>
        <Box as="h3" className="text-lg sm:text-xl md:text-2xl font-bold text-white">
          Upload Your CV
        </Box>
      </Box>

      <Box className="flex flex-col items-center justify-center border-2 border-dashed border-slate-600 rounded-xl p-6 bg-slate-700/40 backdrop-blur-sm hover:border-blue-500 transition-all">
        <input
          id="cv"
          name="cv"
          type="file"
          accept=".pdf"
          className="hidden"
          onChange={handleFileChange}
        />

        {!formik.values.cv ? (
          <label
            htmlFor="cv"
            className="cursor-pointer flex flex-col items-center space-y-2 text-gray-300 hover:text-blue-400 transition-colors"
          >
            <Upload className="h-6 w-6 sm:h-8 sm:w-8" />
            <span className="text-sm sm:text-base">Click to upload your CV (Only PDF)</span>
          </label>
        ) : (
          <Box className="flex items-center justify-between w-full p-3 bg-slate-800/50 rounded-lg">
            <span className="truncate text-sm sm:text-base text-gray-200">
              {formik.values.cv.name}
            </span>
            <Box className="flex gap-2">
              <Box
                as="button"
                type="button"
                onClick={handleViewFile}
                className="text-blue-400 hover:text-blue-500 transition-colors px-3 py-1 border border-blue-400/30 rounded-lg"
              >
                View
              </Box>
              <Box
                as="button"
                type="button"
                onClick={handleRemoveFile}
                className="text-red-400 hover:text-red-500 transition-colors px-3 py-1 border border-red-400/30 rounded-lg flex items-center"
              >
                <Trash2 className="h-4 w-4 sm:h-5 sm:w-5" />
              </Box>
            </Box>
          </Box>
        )}
      </Box>

      {formik.touched.cv && formik.errors.cv && (
        <Box className="text-red-400 text-sm mt-2 flex items-center gap-2 bg-red-500/10 px-3 py-2 rounded-lg border border-red-500/20">
          <Box className="w-1.5 h-1.5 bg-red-400 rounded-full" />
          {formik.errors.cv}
        </Box>
      )}
    </Box>
  );
};

export default FileUploadSection;
