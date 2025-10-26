'use client';

import Image from 'next/image';
import { Mentor } from '../../../../../public/images';
import LoginForm from '@/components/common/login-form';

export default function LoginPage() {
  return (
    <div className="flex h-screen bg-black relative justify-between overflow-hidden">
      <div className="absolute inset-0 " style={{ backgroundImage: "url('/noise.svg')" }}></div>
      {/* Left side */}

      <div className="hidden lg:flex lg:w-1/2 max-w-2xl h-screen relative">
        <Image src={Mentor} alt="mentor" fill className="rounded-r-[40px]" />
      </div>

      {/*Login form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-6 z-50">
        <div className="w-full max-w-md">
          <LoginForm role="staff" onSubmit={() => {}} />
        </div>
      </div>
    </div>
  );
}
