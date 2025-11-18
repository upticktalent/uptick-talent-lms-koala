import ApplicationStatusPage from './ApplicationStatusPage';

export default function Page({ searchParams }: { searchParams: any }) {
  const applicantId = searchParams.id || null;

  return <ApplicationStatusPage applicantId={applicantId} />;
}
