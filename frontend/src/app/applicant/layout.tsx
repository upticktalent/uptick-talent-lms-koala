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
    <div className="min-h-screen bg-gray-50">
      {children}
    </div>
  );
}