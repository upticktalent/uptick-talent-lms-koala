import Box from "@/components/ui/box";
import ApplicationForm from "./application-form";

export default function ApplicantPage() {
  return (
    <Box 
      className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50 py-6 sm:py-8 px-4 sm:px-6"
      data-testid="applicant-page-container"
    >
      <ApplicationForm />
    </Box>
  );
}