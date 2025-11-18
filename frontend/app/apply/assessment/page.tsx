import AssessmentPage from './AssessmentPage';

export default function Page({ searchParams }: { searchParams: any }) {
  const applicantId = searchParams.applicant || null;

  return <AssessmentPage applicantId={applicantId} />;
}
