/* eslint-disable @typescript-eslint/no-explicit-any */
// lib/api/auth.ts
'use server';

import { cookies } from 'next/headers';
import { client } from './api';

export async function loginUser(credentials: { email: string; password: string }) {
  const cookieStore = await cookies();
  try {
    const res = await client.post('/auth/login', credentials);

    if (res.data?.data?.token) {
      cookieStore.set('access_token', res.data.data.token, {
        httpOnly: true,
        secure: true,
        path: '/',
        maxAge: 60 * 60 * 12,
      });
    }

    return res.data;
  } catch (error: any) {
    throw new Error(error.response?.data?.message || 'Login failed');
  }
}
