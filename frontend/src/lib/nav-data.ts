import { Info, BookOpen, HelpCircle } from 'lucide-react';

interface NavItem {
  label: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
}

export const navItems: NavItem[] = [
  {
    label: 'Tracks',
    href: 'tracks',
    icon: BookOpen,
  },
  {
    label: 'About',
    href: 'about',
    icon: Info,
  },
  {
    label: 'FAQ',
    href: 'faq',
    icon: HelpCircle,
  },
];
