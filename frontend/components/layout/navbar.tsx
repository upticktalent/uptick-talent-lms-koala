"use client";

import { useUser } from "@/hooks/useUser";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";

interface NavbarProps {
  title?: string;
  onOpenSidebar?: () => void;
}

export function Navbar({ title, onOpenSidebar }: NavbarProps) {
  const { user, fullName, initials } = useUser();
  const { logout } = useAuth();

  const handleLogout = async () => {
    try {
      await logout();
    } catch (error) {
      console.error("Logout error:", error);
    }
  };

  return (
    <header className="bg-white shadow-sm border-b">
      <div className="flex items-center justify-between px-4 md:px-6 py-4">
        <div className="flex items-center gap-3">
          {/* Mobile: hamburger */}
          <button
            className="md:hidden inline-flex items-center justify-center p-2 rounded-md text-gray-700 hover:bg-gray-100"
            onClick={() => onOpenSidebar?.()}
            aria-label="Open sidebar"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-6 w-6"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M4 6h16M4 12h16M4 18h16"
              />
            </svg>
          </button>

          <div>
            {title && (
              <h1 className="text-xl font-semibold text-gray-900">{title}</h1>
            )}
          </div>
        </div>

        <div className="flex items-center space-x-4">
          {user && (
            <>
              <div className="flex items-center space-x-3">
                <div className="flex items-center justify-center w-8 h-8 bg-blue-500 text-white rounded-full text-sm font-medium">
                  {initials}
                </div>
                <div className="text-sm">
                  <div className="font-medium text-gray-900">{fullName}</div>
                  <div className="text-gray-500 capitalize">{user.role}</div>
                </div>
              </div>
              <Button variant="outline" size="sm" onClick={handleLogout}>
                Logout
              </Button>
            </>
          )}
        </div>
      </div>
    </header>
  );
}
