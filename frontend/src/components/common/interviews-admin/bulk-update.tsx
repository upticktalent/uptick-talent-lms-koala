'use client';

import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import Box from '@/components/ui/box';

interface BulkInterviewModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  selectedCount: number;
  onBulkUpdate: (action: 'completed' | 'cancelled' | 'rescheduled') => void;
}

export default function BulkInterviewModal({
  open,
  onOpenChange,
  selectedCount,
  onBulkUpdate,
}: BulkInterviewModalProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md bg-white border border-indigo-100">
        <DialogHeader>
          <DialogTitle className="text-indigo-700">Bulk Update Interviews</DialogTitle>
        </DialogHeader>
        <p className="text-gray-700 text-sm">
          You have selected {selectedCount} interview(s). What action would you like to perform?
        </p>
        <Box className="space-y-3 pt-4">
          <Button
            onClick={() => onBulkUpdate('completed')}
            className="w-full bg-indigo-600 hover:bg-indigo-700 text-white justify-start"
            variant="default"
          >
            Mark as Completed
          </Button>
          <Button
            onClick={() => onBulkUpdate('cancelled')}
            className="w-full bg-red-600 hover:bg-red-700 text-white justify-start"
            variant="default"
          >
            Cancel Interviews
          </Button>
          <Button
            onClick={() => onBulkUpdate('rescheduled')}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white justify-start"
            variant="default"
          >
            Reschedule All
          </Button>
        </Box>
        <Box className="flex gap-3 pt-4 border-t border-gray-200">
          <Button
            onClick={() => onOpenChange(false)}
            className="flex-1 bg-transparent border border-gray-300 text-gray-700 hover:bg-gray-50 cursor-pointer"
          >
            Cancel
          </Button>
        </Box>
      </DialogContent>
    </Dialog>
  );
}
