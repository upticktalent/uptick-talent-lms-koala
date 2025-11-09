import Image from 'next/image';

import { AdminLogo } from '../../../public/images';
import { Navigation } from './side-navigation';
import Link from 'next/link';
import { Settings } from 'lucide-react';
import Box from '../ui/box';

export default function Sidebar({ cohort }: { cohort: string }) {
  return (
    <aside className="hidden lg:flex flex-col w-64 border-r  border-gray-100 bg-white">
      <Box className="p-4 border-b border-gray-100">
        <Image src={AdminLogo} alt="logo" className="w-40 mx-auto" />
      </Box>
      <Box className="flex-1 p-4 overflow-y-auto">
        <Navigation cohort={cohort} />
      </Box>

      <Box className="p-4 border-t border-gray-100">
        <Link
          href={`/admin/${cohort.toLowerCase().replace(' ', '-')}/settings`}
          className="flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-200 text-gray-600 hover:bg-gray-50 hover:text-gray-900 mb-2"
        >
          <Settings className="w-4 h-4 shrink-0" />
          <span className="text-sm font-medium">Settings</span>
        </Link>

        <Box className="flex items-center gap-3 p-2">
          <Box className="relative">
            <Box className="w-8 h-8 rounded-full bg-indigo-600 flex items-center justify-center text-white text-sm font-semibold shadow-sm">
              A
            </Box>
            <Box className="absolute -bottom-1 -right-1 w-3 h-3 bg-green-400 rounded-full border-2 border-white" />
          </Box>
          <Box className="flex-1 min-w-0">
            <p className="text-gray-900 font-medium text-sm truncate">Admin User</p>
            <p className="text-gray-500 text-xs truncate">admin@fellowship.com</p>
          </Box>
        </Box>
      </Box>
    </aside>
  );
}
