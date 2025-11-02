import { useEffect, useRef, useState } from 'react';

interface User {
  name: string;
  email: string;
  avatar?: string;
}

export function useHeaderMenu() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const headerRef = useRef<HTMLElement | null>(null);
  const sidebarRef = useRef<HTMLElement | null>(null);

  const [isProfileOpen, setIsProfileOpen] = useState(false);

  const user: User | null = {
    name: 'Bello Qudus',
    email: 'qudusbello51@gmail.com',
    avatar: '/images/staff.jpg',
  };

  const handleLogout = () => {
    setIsProfileOpen(false);
  };

  // Handle scroll state
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Close sidebar when clicking outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (sidebarRef.current && !sidebarRef.current.contains(e.target as Node)) {
        const menuButton = headerRef.current?.querySelector('button[aria-label="Toggle menu"]');
        if (menuButton && !menuButton.contains(e.target as Node)) {
          setIsMenuOpen(false);
        }
      }
    };

    if (isMenuOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isMenuOpen]);

  // Close sidebar on Escape key
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setIsMenuOpen(false);
      }
    };

    if (isMenuOpen) {
      document.addEventListener('keydown', handleEscape);
    }

    return () => document.removeEventListener('keydown', handleEscape);
  }, [isMenuOpen]);

  return {
    isMenuOpen,
    setIsMenuOpen,
    isScrolled,
    headerRef,
    sidebarRef,
    isProfileOpen,
    user,
    handleLogout,
    setIsProfileOpen,
  };
}
