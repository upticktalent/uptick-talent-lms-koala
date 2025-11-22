import type { Metadata, Viewport } from 'next';
import { Raleway, Inter } from 'next/font/google';
import './globals.css';
import { AuthProvider } from '@/hooks/useAuth';
import { ThemeProvider } from '@/components/theme-provider';
import { Toaster } from 'sonner';

const raleway = Raleway({
  subsets: ['latin'],
  weight: ['300', '400', '500', '600', '700'],
  display: 'swap',
  variable: '--font-raleway',
});

const inter = Inter({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
  display: "swap",
  variable: "--font-inter",
});

export const metadata: Metadata = {
  title: {
    template: "%s | Uptick Talent LMS",
    default: "Uptick Talent LMS",
  },
  description:
    "Modern Learning Management System - Empowering talent through technology",
  keywords:
    "LMS, Learning Management System, Uptick Talent, Education, Training",
  authors: [{ name: "Uptick Talent" }],
};
export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: "#477BFF",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang='en' suppressHydrationWarning>
      <body
        className={`${raleway.variable} ${inter.variable} font-raleway antialiased`}
      >
          <AuthProvider>{children}</AuthProvider>
          <Toaster position='top-right' />
      </body>
    </html>
  );
}
