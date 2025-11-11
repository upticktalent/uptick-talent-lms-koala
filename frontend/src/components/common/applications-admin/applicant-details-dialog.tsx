'use client';

import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import ApplicantDetails from './application-details';
import { Applicant } from '@/types/assessments-admin';

interface ApplicantDetailsDialogProps {
  applicant: Applicant | null;
  onClose: () => void;
}

export default function ApplicantDetailsDialog({
  applicant,
  onClose,
}: ApplicantDetailsDialogProps) {
  return (
    <Dialog open={!!applicant} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto bg-white border border-indigo-100">
        <DialogHeader>
          <DialogTitle className="text-indigo-700">Applicant Details</DialogTitle>
        </DialogHeader>
        {applicant && <ApplicantDetails applicant={applicant} onClose={onClose} />}
      </DialogContent>
    </Dialog>
  );
}
