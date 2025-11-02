'use client';

import Link from 'next/link';
import { Menu, X, LogOut, User } from 'lucide-react';
import Image from 'next/image';
import { Logo } from '../../../public/images';
import { Button } from '../ui/button';
import { useHeaderMenu } from '@/hooks/use-header-menu';
import { navItems } from '@/lib/nav-data';
import Box from '../ui/box';
import { useClickOutside } from '@/hooks/use-click-outside';

export default function Header() {
  const {
    isMenuOpen,
    setIsMenuOpen,
    isScrolled,
    headerRef,
    sidebarRef,
    isProfileOpen,
    user,
    handleLogout,
    setIsProfileOpen,
  } = useHeaderMenu();

  const ref = useClickOutside(handleClose);

  function handleClose() {
    setIsProfileOpen(false);
  }

  return (
    <>
      <header
        ref={headerRef}
        className={`fixed top-0 left-0 z-50 w-full backdrop-blur-xl transition-all duration-300 ${
          isScrolled
            ? 'bg-gradient-to-b from-slate-950 to-black border-b border-slate-800'
            : 'bg-transparent'
        }`}
      >
        {/* Header Content */}
        <Box className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-6 flex items-center justify-between z-10">
          {/* Uptick Logo */}
          <Link
            href="/"
            className="flex items-center gap-2 hover:opacity-80 transition-opacity flex-shrink-0"
          >
            <Image src={Logo} alt="Uptick Talent" className="h-8 w-auto" />
          </Link>

          {/* Nav */}
          <nav className="hidden md:flex items-center gap-8 lg:gap-12">
            {navItems.map(item => (
              <a
                key={item.href}
                href={`#${item.href}`}
                className="text-gray-300 hover:text-white transition-colors font-medium text-sm"
              >
                {item.label}
              </a>
            ))}
          </nav>

          <div className="flex items-center gap-4" ref={ref}>
            {user ? (
              <Box className="hidden md:block relative">
                <button
                  onClick={() => setIsProfileOpen(!isProfileOpen)}
                  className="flex items-center gap-2 px-3 py-2 hover:bg-slate-800 rounded-lg transition-colors"
                >
                  {user.avatar ? (
                    <Image
                      src={user.avatar}
                      alt={user.name}
                      width={32}
                      height={32}
                      className="w-8 h-8 rounded-full object-cover"
                    />
                  ) : (
                    <Box className="w-8 h-8 rounded-full bg-gradient-to-br from-primary to-blue-600 flex items-center justify-center">
                      <span className="text-white text-xs font-semibold">
                        {user.name
                          .split(' ')
                          .map(n => n[0])
                          .join('')}
                      </span>
                    </Box>
                  )}
                  <Box className="text-left hidden sm:block">
                    <p className="text-sm font-medium text-white">{user.name}</p>
                    <p className="text-xs text-gray-400">{user.email}</p>
                  </Box>
                </button>

                {/* Profile Menu */}
                {isProfileOpen && (
                  <Box className="absolute right-0 mt-2 w-56 bg-slate-900 border border-slate-800 rounded-xl shadow-xl overflow-hidden z-50">
                    <Box className="p-4 border-b border-slate-800">
                      <p className="text-sm font-semibold text-white">{user.name}</p>
                      <p className="text-xs text-gray-400">{user.email}</p>
                    </Box>
                    <nav className="flex flex-col">
                      <Link
                        href={''}
                        className="px-4 py-3 text-sm text-gray-300 hover:text-white hover:bg-slate-800 transition-colors flex items-center gap-2"
                        onClick={() => setIsProfileOpen(false)}
                      >
                        <User className="w-4 h-4" />
                        My Dashboard
                      </Link>
                      <button
                        onClick={handleLogout}
                        className="w-full px-4 py-3 text-sm text-red-400 hover:text-red-300 hover:bg-red-900/20 transition-colors flex items-center gap-2 border-t border-slate-800 text-left"
                      >
                        <LogOut className="w-4 h-4" />
                        Sign Out
                      </button>
                    </nav>
                  </Box>
                )}
              </Box>
            ) : (
              <button className="hidden md:block px-6 py-2.5 bg-[#477BFF] hover:bg-[#477BFF]/90 text-white rounded-lg font-medium transition-all duration-200 text-sm cursor-pointer">
                Sign In
              </button>
            )}

            {/* Menu Toggle */}
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="md:hidden p-2 hover:bg-slate-800 rounded-lg transition-colors text-gray-300 hover:text-white cursor-pointer"
              aria-label="Toggle menu"
            >
              {isMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </Box>
      </header>

      {/* Overlay */}
      {isMenuOpen && (
        <Box
          className="fixed inset-0 z-40 bg-black/50 backdrop-blur-sm md:hidden transition-opacity duration-300"
          onClick={() => setIsMenuOpen(false)}
        />
      )}

      {/* Mobile Sidebar */}
      <aside
        ref={sidebarRef}
        className={`fixed top-0 left-0 h-screen w-64 z-50 bg-gradient-to-b from-slate-900 to-slate-950 border-r border-slate-800 md:hidden transition-transform duration-300 ease-in-out ${
          isMenuOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {/* Sidebar Header */}
        <Box className="flex items-center justify-between p-6 border-b border-slate-800">
          <Link href="/" onClick={() => setIsMenuOpen(false)} className="flex items-center gap-2">
            <Image src={Logo} alt="Uptick Talent" className="h-8 w-auto" />
          </Link>
        </Box>

        {/* User Profile */}
        {user && (
          <Box className="p-4 border-b border-slate-800 mx-4 mt-4 bg-slate-800/50 rounded-lg">
            <Box className="flex items-center gap-3">
              {user.avatar ? (
                <Image
                  src={user.avatar}
                  alt={user.name}
                  width={40}
                  height={40}
                  className="w-10 h-10 rounded-full object-cover"
                />
              ) : (
                <Box className="w-10 h-10 rounded-full bg-gradient-to-br from-primary to-blue-600 flex items-center justify-center flex-shrink-0">
                  <span className="text-white text-sm font-semibold">
                    {user.name
                      .split(' ')
                      .map(n => n[0])
                      .join('')}
                  </span>
                </Box>
              )}
              <Box>
                <p className="text-sm font-semibold text-white">{user.name}</p>
                <p className="text-xs text-gray-400">{user.email}</p>
              </Box>
            </Box>
          </Box>
        )}

        {/* Sidebar Nav */}
        <nav className="flex flex-col gap-2 p-6">
          {navItems.map(item => {
            const Icon = item.icon;
            return (
              <a
                key={item.href}
                href={`#${item.href}`}
                onClick={() => setIsMenuOpen(false)}
                className="flex items-center gap-3 px-4 py-3 text-gray-300 hover:text-white hover:bg-slate-800 rounded-lg transition-all duration-200 group"
              >
                <Icon className="w-5 h-5 text-primary group-hover:scale-110 transition-transform" />
                <span className="font-medium">{item.label}</span>
              </a>
            );
          })}
        </nav>

        {/* Sidebar Footer */}
        <Box className="absolute bottom-0 left-0 right-0 p-6 border-t border-slate-800 space-y-3">
          {user ? (
            <>
              <Link
                href=""
                onClick={() => setIsMenuOpen(false)}
                className="w-full px-4 py-2.5 bg-slate-800 hover:bg-slate-700 text-white rounded-lg font-medium transition-colors text-sm text-center block"
              >
                Dashboard
              </Link>
              <button
                onClick={handleLogout}
                className="w-full px-4 py-2.5 bg-red-900/30 hover:bg-red-900/50 text-red-400 rounded-lg font-medium transition-colors text-sm"
              >
                Sign Out
              </button>
            </>
          ) : (
            <Button className="w-full px-4 py-3 bbg-[#477BFF] hover:bg-[#477BFF]/90  transition-all duration-200 cursor-pointer">
              Sign In
            </Button>
          )}
        </Box>
      </aside>
    </>
  );
}
