'use client';

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Download, ClipboardList, X } from 'lucide-react';
import Box from '@/components/ui/box';
import AssessmentDetails from './assessment-details';
import { Assessment } from '@/types/assessments-admin';

interface AssessmentDetailsDialogProps {
  assessment: Assessment | null;
  onClose: () => void;
  onDownload: (assessment: Assessment) => void;
  onStatusChange: (id: string, status: Assessment['status'], assessment: Assessment) => void;
  loadingIds: Set<string>;
}

export default function AssessmentDetailsDialog({
  assessment,
  onClose,
  onDownload,
  onStatusChange,
  loadingIds,
}: AssessmentDetailsDialogProps) {
  const isAssessmentLoading = (id: string) => loadingIds.has(id);

  const handleReject = async () => {
    if (!assessment) return;
    await onStatusChange(assessment._id, 'reviewed', assessment);
    onClose();
  };

  const handleUnderReview = async () => {
    if (!assessment) return;
    await onStatusChange(assessment._id, 'under-review', assessment);
    onClose();
  };

  return (
    <Dialog open={!!assessment} onOpenChange={onClose}>
      <DialogContent className="max-w-6xl w-full bg-white border border-indigo-100 max-h-[90vh] rounded-lg shadow-lg flex flex-col">
        <DialogHeader className="px-6 pt-6">
          <DialogTitle className="text-indigo-700 text-xl text-center font-semibold">
            Assessment Details
          </DialogTitle>
          <DialogDescription className="text-gray-500 text-center text-sm mt-1">
            Review the submitted assessment and take action
          </DialogDescription>
        </DialogHeader>

        {/* Scrollable content area */}
        <Box className="overflow-y-auto flex-1 space-y-4 px-6 element">
          {assessment && <AssessmentDetails assessment={assessment} />}
        </Box>

        {/* Footer with buttons */}
        <DialogFooter className="flex flex-col sm:flex-row justify-between gap-3 px-6 py-4 border-t bg-white">
          {/* Download Button */}
          <Button
            onClick={() => assessment && onDownload(assessment)}
            className="flex items-center gap-2 bg-green-50 hover:bg-green-100 text-green-700 border border-green-200 cursor-pointer transition-colors duration-200"
          >
            <Download className="w-4 h-4 mr-2" />
            Download
          </Button>

          {/* Action Buttons */}
          <Box className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
            <Button
              onClick={handleReject}
              disabled={
                assessment?.status === 'reviewed' || isAssessmentLoading(assessment?._id || '')
              }
              className="flex-1 sm:flex-none w-full sm:w-auto bg-green-500 text-white border border-green-500 hover:bg-green-600 transition-colors duration-150 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <X className="w-4 h-4 mr-2" />
              Review
            </Button>
            <Button
              onClick={handleUnderReview}
              disabled={
                assessment?.status === 'under-review' || isAssessmentLoading(assessment?._id || '')
              }
              className="flex-1 sm:flex-none w-full sm:w-auto bg-indigo-600 hover:bg-indigo-700 text-white transition-colors duration-150 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <ClipboardList className="w-4 h-4 mr-2" />
              Mark for Review
            </Button>
          </Box>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
