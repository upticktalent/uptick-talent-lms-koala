'use client';

import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Loader } from 'lucide-react';
import Box from '@/components/ui/box';

interface BulkUpdateModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  selectedCount: number;
  onBulkUpdate: (action: 'shortlisted' | 'rejected') => void;
  isUpdating: boolean;
}

export default function BulkUpdateModal({
  open,
  onOpenChange,
  selectedCount,
  onBulkUpdate,
  isUpdating,
}: BulkUpdateModalProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md bg-white border border-indigo-100">
        <DialogHeader>
          <DialogTitle className="text-indigo-700">Bulk Update Applicants</DialogTitle>
        </DialogHeader>

        {isUpdating ? (
          <Box className="flex flex-col items-center justify-center py-6">
            <Loader className="w-8 h-8 animate-spin text-indigo-600 mb-3" />
            <p className="text-gray-700 text-sm text-center">
              Updating {selectedCount} applicant(s)...
              <br />
              <span className="text-gray-500">This may take a few moments</span>
            </p>
          </Box>
        ) : (
          <>
            <p className="text-gray-700 text-sm">
              You have selected {selectedCount} applicant(s). What action would you like to perform?
            </p>
            <Box className="flex gap-3 pt-4">
              <Button
                onClick={() => onBulkUpdate('shortlisted')}
                className="flex-1 bg-indigo-600 hover:bg-indigo-700 text-white"
                disabled={isUpdating}
              >
                Shortlist All
              </Button>
              <Button
                onClick={() => onBulkUpdate('rejected')}
                className="flex-1 bg-red-600 hover:bg-red-700 text-white"
                disabled={isUpdating}
              >
                Reject All
              </Button>
            </Box>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}
