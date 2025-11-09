// app/admin/page.tsx
import { getActiveCohort } from '@/lib/cohort';
import { redirect } from 'next/navigation';

export default async function AdminPage() {
  const activeCohort = await getActiveCohort();

  redirect(`/admin/${activeCohort?.data?.name.toLowerCase().replace(' ', '-')}/applications`);
}
