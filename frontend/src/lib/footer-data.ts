import { Mail, Linkedin, Twitter, Github } from 'lucide-react';

export const footerLinks = {
  product: [
    { label: 'Tracks', href: '#tracks' },
    { label: 'Curriculum', href: '#' },
    { label: 'Pricing', href: '#' },
  ],
  company: [
    { label: 'About', href: '#about' },
    { label: 'Blog', href: '#' },
    { label: 'Contact', href: '#' },
  ],
  legal: [
    { label: 'Privacy Policy', href: '#' },
    { label: 'Terms of Service', href: '#' },
    { label: 'Cookie Policy', href: '#' },
  ],
};

export const socialLinks = [
  { icon: Linkedin, href: '#', label: 'LinkedIn' },
  { icon: Twitter, href: '#', label: 'Twitter' },
  { icon: Github, href: '#', label: 'GitHub' },
  { icon: Mail, href: '#', label: 'Email' },
];
