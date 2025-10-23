'use client';

import Box from '@/components/ui/box';
import React from 'react';
import LoginForm, { LoginFormData } from '@/components/common/login-form';

const Entry = () => {
  function handleSubmit(data: LoginFormData): void {
    console.log(data);
  }

  return (
    <Box className="flex min-h-svh sm: overflow-hidden bg-black">
      <LoginForm role="student" onSubmit={handleSubmit} />
    </Box>
  );
};

export default Entry;
