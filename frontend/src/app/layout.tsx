import './globals.css';
import { AppProvider } from '@/lib/providers';
import { Toaster } from 'sonner';
import { ThemeProvider } from '@/lib/providers/theme-provider';
import { fonts } from '@/lib/fonts';
import { cn } from '@/lib/utils';

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={cn(fonts.geistSans.variable, fonts.geistMono.variable, 'antialiased')}>
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
      </body>
    </html>
  );
}
