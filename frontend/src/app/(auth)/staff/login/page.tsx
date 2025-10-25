import Image from 'next/image';
import { Mentor } from '../../../../../public/images';

export default function LoginPage() {
  return (
    <div className="flex h-screen bg-black relative">
      <div className="absolute inset-0 " style={{ backgroundImage: "url('/noise.svg')" }}></div>
      {/* Left side */}

      <div className="hidden lg:flex lg:w-1/2 h-screen relative">
        <Image src={Mentor} alt="mentor" fill className="rounded-r-[40px]" />
      </div>

      {/*Login form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-6 z-50">
        <div className="w-full max-w-md">
          <p className="text-white text-center text-xl">Login form goes here</p>
        </div>
      </div>
    </div>
  );
}
