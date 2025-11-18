'use client';

import { useUser } from '@/hooks/useUser';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';

interface NavbarProps {
  title?: string;
}

export function Navbar({ title }: NavbarProps) {
  const { user, fullName, initials } = useUser();
  const { logout } = useAuth();

  const handleLogout = async () => {
    try {
      await logout();
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  return (
    <header className='bg-white shadow-sm border-b'>
      <div className='flex items-center justify-between px-6 py-4'>
        <div>
          {title && (
            <h1 className='text-xl font-semibold text-gray-900'>{title}</h1>
          )}
        </div>

        <div className='flex items-center space-x-4'>
          {user && (
            <>
              <div className='flex items-center space-x-3'>
                <div className='flex items-center justify-center w-8 h-8 bg-blue-500 text-white rounded-full text-sm font-medium'>
                  {initials}
                </div>
                <div className='text-sm'>
                  <div className='font-medium text-gray-900'>{fullName}</div>
                  <div className='text-gray-500 capitalize'>{user.role}</div>
                </div>
              </div>
              <Button variant='link' size='sm' onClick={handleLogout}>
                Logout
              </Button>
            </>
          )}
        </div>
      </div>
    </header>
  );
}
