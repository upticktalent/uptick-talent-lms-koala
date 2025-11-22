import Image from "next/image";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Application Portal",
};

export default function ApplyLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-[hsl(var(--background))]">
      {/* FIXED HEADER - slim, minimal, professional */}
      <header className="bg-[hsl(var(--background))] border-b border-[hsl(var(--border))] fixed top-0 left-0 w-full z-50 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-3">
              <Image
                src="/uptick-logo.png"
                alt="Uptick Talent"
                width={70}
                height={70}
                className="object-contain rounded"
              />
            </div>

            <div className="text-sm text-[hsl(var(--muted-foreground))] hidden sm:block">
              Secure application platform
            </div>
          </div>
        </div>
      </header>

      {/* MAIN CONTENT WITH TOP PADDING MATCHING HEADER HEIGHT */}
      <main className="max-w-4xl mx-auto py-8 px-4 sm:px-6 lg:px-8 pt-16">
        {children}
      </main>
    </div>
  );
}
