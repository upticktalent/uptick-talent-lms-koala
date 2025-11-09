'use server';

import { revalidatePath } from 'next/cache';
import { cookies } from 'next/headers';

export async function reviewApplicationAction(id: string, status: string, notes: string) {
  try {
    console.log('➡️ Starting reviewApplicationAction...');

    // get auth token
    const cookieStore = await cookies();
    const token = cookieStore.get('access_token')?.value;

    if (!token) {
      console.error('❌ No token found in cookies');
      throw new Error('Unauthorized: Missing access token');
    }

    // prepare request body
    const payload = { status, notes };

    // send request to backend
    const res = await fetch(
      `https://uptick-lms-backend.onrender.com/api/applications/${id}/review`,
      {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
        cache: 'no-store',
      },
    );

    console.log('🌍 API Response Status:', res.status);

    if (!res.ok) {
      const errorText = await res.text();
      console.error('❌ API Request Failed:', errorText);
      throw new Error(`Failed to review application: ${errorText}`);
    }

    // optional: inspect response data
    const data = await res.json().catch(() => null);

    // revalidate application list
    revalidatePath('/applications');

    return { success: true, data };
  } catch (error) {
    console.error('💥 reviewApplicationAction Error:', error);
    return { success: false, error: (error as Error).message };
  }
}
