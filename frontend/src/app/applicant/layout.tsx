import Box from '@/components/ui/box';
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Apply to Uptick Talent - Application Form',
  description: 'Join Uptick Talent program. Submit your application to start your tech career journey.',
};

interface ApplicantLayoutProps {
  children: React.ReactNode;
}

export default function ApplicantLayout({ children }: ApplicantLayoutProps) {
  return (
    <Box className="min-h-screen bg-gray-50">
      {children}
    </Box>
  );
}