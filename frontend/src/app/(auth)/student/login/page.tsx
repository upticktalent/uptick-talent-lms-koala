'use client';

import Image from 'next/image';
import Student from '../../../../../public/images/studentimage.png';
import frame from '../../../../../public/frame.png';
import Logo from '../../../../../public/upticklogo.svg';
import LoginForm from '@/components/common/login-form';
import Box from '@/components/ui/box';

export default function LoginPage() {
  return (
    <Box className="flex flex-col lg:flex-row h-screen bg-black relative overflow-hidden">
      <Box className="absolute inset-0 bg-[url('/noise.svg')] bg-cover bg-center" />

      <Box className="hidden lg:flex lg:w-1/2 max-w-2xl h-full relative">
        <Image
          src={frame}
          alt="Background Frame"
          fill
          className="object-cover rounded-r-[40px]"
          priority
        />

        <Box className="absolute inset-0 flex items-center justify-center">
          <Image
            src={Student}
            alt="Student"
            width={400}
            height={400}
            className="object-contain drop-shadow-2xl transition-transform duration-700 hover:scale-105"
          />
        </Box>

        <Box className="absolute top-8 left-8 z-20 hidden lg:block">
          <Image
            src={Logo}
            alt="App Logo"
            width={100}
            height={100}
            className="object-contain filter brightness-0 contrast-150"
          />
        </Box>
      </Box>

      <Box className="flex-1 flex items-center justify-center p-6 relative z-10 bg-black lg:bg-transparent">
        <Box className="absolute inset-0 bg-[url('/noise.svg')] opacity-20"></Box>
        <Box className="absolute inset-0 bg-gradient-to-b from-black/90 via-black/80 to-black/90 lg:from-transparent lg:via-transparent lg:to-transparent"></Box>

        <Box className="w-full max-w-md relative z-20">
          <LoginForm role="student" onSubmit={() => {}} />
        </Box>
      </Box>
    </Box>
  );
}
