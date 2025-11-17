import { RoleGuard } from '@/middleware/roleGuard';

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <RoleGuard allowedRoles={['admin']}>
      <div className='min-h-screen bg-gray-50'>
        <div className='bg-white shadow-sm border-b'>
          <div className='max-w-7xl mx-auto px-4 sm:px-6 lg:px-8'>
            <div className='flex justify-between items-center py-6'>
              <div className='flex items-center'>
                <h1 className='text-2xl font-bold text-gray-900'>
                  Admin Panel
                </h1>
              </div>
              <div className='text-sm text-gray-600'>System Administration</div>
            </div>
          </div>
        </div>
        <main className='max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8'>
          {children}
        </main>
      </div>
    </RoleGuard>
  );
}
