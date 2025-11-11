'use client';

import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import InterviewDetails from './interview-details';
import { Interview } from './interviews-types';

interface InterviewDetailsDialogProps {
  interview: Interview | null;
  onClose: () => void;
}

export default function InterviewDetailsDialog({
  interview,
  onClose,
}: InterviewDetailsDialogProps) {
  return (
    <Dialog open={!!interview} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto bg-white border border-indigo-100 element">
        <DialogHeader>
          <DialogTitle className="text-indigo-700">Interview Details</DialogTitle>
        </DialogHeader>
        {interview && <InterviewDetails interview={interview} onClose={onClose} />}
      </DialogContent>
    </Dialog>
  );
}
