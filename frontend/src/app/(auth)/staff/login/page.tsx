'use client';

import Image from 'next/image';
import { Mentor } from '../../../../../public/images';
import LoginForm from '@/components/common/login-form';
import Box from '@/components/ui/box';

export default function LoginPage() {
  return (
    <Box className="flex h-screen bg-black relative justify-between overflow-hidden">
      <Box className="absolute inset-0 " style={{ backgroundImage: "url('/noise.svg')" }}></Box>
      {/* Left side */}

      <Box className="hidden lg:flex lg:w-1/2 max-w-2xl h-screen relative">
        <Image src={Mentor} alt="mentor" fill className="rounded-r-[40px]" />
      </Box>

      {/*Login form */}
      <Box className="w-full lg:w-1/2 flex items-center justify-center p-6 z-50">
        <Box className="w-full max-w-md">
          <LoginForm role="staff" onSubmit={() => {}} />
        </Box>
      </Box>
    </Box>
  );
}
