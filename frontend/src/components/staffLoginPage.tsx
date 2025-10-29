'use client';

import Image from 'next/image';
import Student from '@/../public/images/studentLogin.png';
import LoginForm from '@/components/common/login-form'; 

export default function StaffLoginPage() {
  return (
    <div className="flex h-screen bg-black overflow-hidden relative">

      <div className="absolute inset-0 lg:hidden">
        <Image
          src={Student}
          alt="Background"
          fill
          className="object-cover opacity-40"
          priority
        />
        <div className="absolute inset-0 bg-black/5"></div> 
      </div>

      <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden rounded-r-[40px] bg-white">
        
        <div className="absolute inset-0 bg-gradient-to-br from-blue-100 via-purple-100 to-blue-50"></div>

        <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-purple-200 rounded-full blur-3xl opacity-30"></div>
        <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-blue-200 rounded-full blur-3xl opacity-25"></div>
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[400px] h-[400px] bg-indigo-100 rounded-full blur-3xl opacity-20"></div>

        <div className="relative z-10 flex flex-col w-full h-full">

          <div className="absolute top-8 left-8 z-20 flex items-center gap-2">
            <Image
              src="/UP LOGO 222 1.svg"
              alt="UTF LMS Logo"
              width={100}
              height={100}
              className="brightness-0"
            />
          </div>

          <div className="flex-1 flex items-end justify-center px-12">
            <div className="relative w-full max-w-sm">
              <Image
                src={Student}
                alt="mentor image"
                className="w-full h-auto object-cover rounded-none"
              />
            </div>
          </div>
        </div>
      </div>

      
      <div className="flex-1 flex items-center justify-center p-8 lg:p-12 relative">

        <div className="w-full max-w-md relative z-10">
          <LoginForm role="staff" onSubmit={() => {}} />
        </div>
      </div>
    </div>
  );
}
