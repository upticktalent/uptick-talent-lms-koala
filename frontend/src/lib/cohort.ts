// lib/api/cohort.ts
export async function getActiveCohort() {
  const res = await fetch('https://uptick-lms-backend.onrender.com/api/cohorts/current-active', {
    cache: 'no-store',
  });
  if (!res.ok) throw new Error('Failed to fetch active cohort');
  return res.json();
}
