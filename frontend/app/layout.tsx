import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { AuthProvider } from "@/hooks/useAuth";
import { Toaster } from "sonner";

const inter = Inter({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
  display: "swap",
  variable: "--font-inter",
});

export const metadata: Metadata = {
  title: "Uptick Talent LMS",
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
    <html lang="en">
      <body className={inter.className}>
        <AuthProvider>{children}</AuthProvider>
        <Toaster />
      </body>
    </html>
  );
}
