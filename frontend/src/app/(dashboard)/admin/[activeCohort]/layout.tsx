import type { Metadata } from 'next';
import Sidebar from '@/components/common/admin-sidebar';
import { TopBar } from '@/components/common/top-bar';
import { getActiveCohort } from '@/lib/cohort';

export const metadata: Metadata = {
  title: 'Admin | Uptick Talent',
  description: 'Uptick Talent Admin Dashboard',
};

export default async function CohortLayout({ children }: { children: React.ReactNode }) {
  const activeCohort = await getActiveCohort();
  const cohortName = activeCohort?.data?.name;

  return (
    <div className="h-screen flex flex-col bg-gray-50">
      <div className="flex flex-1 overflow-hidden">
        {/* Sidebar */}
        <Sidebar cohort={cohortName} />

        {/* Main Content Area */}
        <div className="flex-1 flex flex-col overflow-hidden">
          {/* Top Bar */}
          <TopBar cohort={cohortName} />

          {/* Page Content */}
          <main className="flex-1 overflow-y-auto">{children}</main>
        </div>
      </div>
    </div>
  );
}
