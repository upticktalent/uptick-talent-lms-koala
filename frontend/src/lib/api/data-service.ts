// lib/api/applications.ts
import { cookies } from 'next/headers';

export async function getApplications() {
  const cookieStore = await cookies();
  const token = cookieStore.get('access_token')?.value;

  const res = await fetch('https://uptick-lms-backend.onrender.com/api/applications', {
    headers: {
      Authorization: `Bearer ${token}`,
    },
    cache: 'no-store',
  });

  if (!res.ok) {
    throw new Error('Failed to fetch applications');
  }

  const data = await res.json();
  console.log(data);

  return data?.data?.applications;
}

export async function getAssessments() {
  const cookieStore = await cookies();
  const token = cookieStore.get('access_token')?.value;

  const res = await fetch('https://uptick-lms-backend.onrender.com/api/assessments', {
    headers: {
      Authorization: `Bearer ${token}`,
    },
    cache: 'no-store',
  });

  if (!res.ok) {
    throw new Error('Failed to fetch applications');
  }

  const data = await res.json();
  console.log(data);

  return data?.data?.assessments;
}
