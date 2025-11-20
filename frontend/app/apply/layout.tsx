import Image from 'next/image';

export default function ApplyLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className='min-h-screen bg-gray-50'>
      <div className='bg-white shadow-sm'>
        <div className='max-w-7xl mx-auto px-4 sm:px-6 lg:px-8'>
          <div className='flex justify-between items-center py-6'>
            <div className='flex items-center'>
              <div className='flex items-start'>
                <div className='relative'>
                  <Image
                    src='/uptick-logo.png'
                    alt='Uptick Talent'
                    width={100}
                    height={100}
                    className='object-contain'
                  />
                </div>
              </div>
            </div>
            <div className='text-2xl font-bold text-gray-600'>
              Application Portal
            </div>
          </div>
        </div>
      </div>
      <main className='max-w-4xl mx-auto py-8 px-4 sm:px-6 lg:px-8'>
        {children}
      </main>
    </div>
  );
}
