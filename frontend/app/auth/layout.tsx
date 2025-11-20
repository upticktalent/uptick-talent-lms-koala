export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-black">
      <div className="min-h-screen grid grid-cols-1 lg:grid-cols-2">
        {/* Image Section - Hidden on mobile, visible on medium screens and up */}
        <div
          className="hidden lg:block h-full min-h-[500px]"
          style={{
            backgroundImage:
              "url('https://images.unsplash.com/photo-1522071820081-009f0129c71c?q=80&w=1200&auto=format&fit=crop&ixlib=rb-4.0.3&s=1b2e4b2f6b4a1d2f6c3b0b7b9f4a8c6a')",
            backgroundSize: "cover",
            backgroundPosition: "center",
            backgroundRepeat: "no-repeat",
          }}
        ></div>

        {/* Content Section */}
        <div className="flex items-center justify-center p-4 sm:p-6 lg:p-8">
          <div className="w-full max-w-7xl mx-auto flex items-center justify-center">
            {children}
          </div>
        </div>
      </div>
    </div>
  );
}
