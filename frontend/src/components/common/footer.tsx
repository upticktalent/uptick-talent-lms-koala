import Image from 'next/image';
import Link from 'next/link';
import { Logo } from '../../../public/images';
import Box from '../ui/box';
import { footerLinks, socialLinks } from '@/lib/footer-data';

export default function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="relative bg-gradient-to-b from-slate-950 to-black border-t border-slate-800">
      <Box className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16 md:py-20">
        {/* Main Footer Content */}
        <Box className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 md:gap-12 mb-12 md:mb-16">
          {/* Brand Section */}
          <Box className="lg:col-span-1">
            <Link
              href="/"
              className="inline-flex items-center gap-2 hover:opacity-80 transition-opacity mb-4"
            >
              <Image src={Logo} alt="Uptick Talent" className="h-8 w-auto" />
            </Link>
            <p className="text-sm text-gray-400 leading-relaxed mb-6">
              Empowering the next generation of tech professionals through industry-leading
              education and mentorship.
            </p>

            {/* Social Links */}
            <Box className="flex items-center gap-4">
              {socialLinks.map(social => {
                const Icon = social.icon;
                return (
                  <a
                    key={social.label}
                    href={social.href}
                    aria-label={social.label}
                    className="p-2.5 bg-slate-900/50 hover:bg-primary/20 border border-slate-800 hover:border-primary/50 rounded-lg transition-all duration-200 text-gray-400 hover:text-primary group"
                  >
                    <Icon className="w-4 h-4 group-hover:scale-110 transition-transform" />
                  </a>
                );
              })}
            </Box>
          </Box>

          {/* Product Links */}
          <Box>
            <h4 className="font-semibold text-white mb-4 text-sm uppercase tracking-wide">
              Product
            </h4>
            <ul className="space-y-3">
              {footerLinks.product.map(link => (
                <li key={link.label}>
                  <Link
                    href={link.href}
                    className="text-sm text-gray-400 hover:text-white transition-colors duration-200 inline-flex items-center gap-2 group"
                  >
                    <span className="w-1.5 h-1.5 rounded-full bg-primary/0 group-hover:bg-primary transition-colors" />
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </Box>

          {/* Company Links */}
          <Box>
            <h4 className="font-semibold text-white mb-4 text-sm uppercase tracking-wide">
              Company
            </h4>
            <ul className="space-y-3">
              {footerLinks.company.map(link => (
                <li key={link.label}>
                  <Link
                    href={link.href}
                    className="text-sm text-gray-400 hover:text-white transition-colors duration-200 inline-flex items-center gap-2 group"
                  >
                    <span className="w-1.5 h-1.5 rounded-full bg-primary/0 group-hover:bg-primary transition-colors" />
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </Box>

          {/* Legal Links */}
          <Box>
            <h4 className="font-semibold text-white mb-4 text-sm uppercase tracking-wide">Legal</h4>
            <ul className="space-y-3">
              {footerLinks.legal.map(link => (
                <li key={link.label}>
                  <Link
                    href={link.href}
                    className="text-sm text-gray-400 hover:text-white transition-colors duration-200 inline-flex items-center gap-2 group"
                  >
                    <span className="w-1.5 h-1.5 rounded-full bg-primary/0 group-hover:bg-primary transition-colors" />
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </Box>
        </Box>

        {/* Bottom Section */}
        <Box className="border-t border-slate-800 pt-8 sm:pt-10">
          <Box className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 text-center sm:text-left">
            <p className="text-xs sm:text-sm text-gray-400">
              &copy; {currentYear} Uptick Talent. All rights reserved.
            </p>
          </Box>
        </Box>
      </Box>
    </footer>
  );
}
