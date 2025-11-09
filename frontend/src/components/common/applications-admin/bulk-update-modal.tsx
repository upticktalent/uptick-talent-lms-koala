'use client';

import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import Box from '@/components/ui/box';

interface BulkUpdateModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  selectedCount: number;
  onBulkUpdate: (action: 'shortlisted' | 'rejected') => void;
}

export default function BulkUpdateModal({
  open,
  onOpenChange,
  selectedCount,
  onBulkUpdate,
}: BulkUpdateModalProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md bg-white border border-indigo-100">
        <DialogHeader>
          <DialogTitle className="text-indigo-700">Bulk Update Applicants</DialogTitle>
        </DialogHeader>
        <p className="text-gray-700 text-sm">
          You have selected {selectedCount} applicant(s). What action would you like to perform?
        </p>
        <Box className="flex gap-3 pt-4">
          <Button
            onClick={() => onBulkUpdate('shortlisted')}
            className="flex-1 bg-indigo-600 hover:bg-indigo-700 text-white"
          >
            Shortlist All
          </Button>
          <Button
            onClick={() => onBulkUpdate('rejected')}
            className="flex-1 bg-red-600 hover:bg-red-700 text-white"
          >
            Reject All
          </Button>
        </Box>
      </DialogContent>
    </Dialog>
  );
}
