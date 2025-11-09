/* eslint-disable @typescript-eslint/no-unused-vars */
// app/dashboard/Actions.tsx
'use client';

import { useMutation } from '@tanstack/react-query';

import { Button } from '@/components/ui/button';
import { loginUser } from '@/lib/admin-auth';

export default function Actions() {
  const loginMutation = useMutation({
    mutationFn: loginUser,
    onSuccess: data => {
      alert('✅ Logged in');
    },
    onError: error => {
      alert('❌ Login error:');
    },
  });

  return (
    <div className="flex gap-4 mt-4">
      <Button
        onClick={() =>
          loginMutation.mutate({
            email: 'admin@upticktalent.com',
            password: 'admin123',
          })
        }
      >
        Quick Login
      </Button>
    </div>
  );
}
