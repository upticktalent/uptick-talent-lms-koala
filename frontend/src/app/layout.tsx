import './globals.css';
import { AppProvider } from '@/lib/providers';
import { Toaster } from 'sonner';
import { ThemeProvider } from '@/lib/providers/theme-provider';
import { fonts } from '@/lib/fonts';
import { cn } from '@/lib/utils';
import Box from '@/components/ui/box';
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Uptick LMS - Learn Tech Skills',
  description: 'Explore program tracks and launch your tech career with Uptick Talent LMS.',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <Box as="html" lang="en" suppressHydrationWarning>
      <Box
        as="body"
        className={cn(fonts.raleway.className, fonts.geistSans.className, 'antialiased')}
      >
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <AppProvider>
            {children}
            <Toaster />
          </AppProvider>
        </ThemeProvider>
        <Toaster position="top-right" />
      </Box>
    </Box>
  );
}
