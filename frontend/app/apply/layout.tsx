import Image from 'next/image';
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: "Application Portal",
};

export default function ApplyLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="h-screen overflow-y-auto bg-gray-50">
      
      {/* FIXED HEADER */}
      <header className="bg-white shadow-sm fixed top-0 left-0 w-full z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div className="flex items-start">
              <Image
                src="/uptick-logo.png"
                alt="Uptick Talent"
                width={100}
                height={100}
                className="object-contain"
              />
            </div>

            <div className="text-2xl font-bold text-gray-600">
              Application Portal
            </div>
          </div>
        </div>
      </header>

      {/* MAIN CONTENT WITH TOP PADDING SO IT'S NOT UNDER THE FIXED HEADER */}
      <main className="max-w-4xl mx-auto py-8 px-4 sm:px-6 lg:px-8 pt-32">
        {children}
      </main>

    </div>
  );
}
