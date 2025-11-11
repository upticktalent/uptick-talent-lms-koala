import Box from '@/components/ui/box';
import ApplicationForm from './applicationform';

export default function ApplicantPage() {
  return (
    <Box className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50 py-8 px-4">
      <ApplicationForm />
    </Box>
  );
}