"use client";

import { useUser } from "@/hooks/useUser";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Menu, LogOut, User, ChevronDown, Bell, Settings } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "../ui/dropdown-menu";
import { useRouter } from "next/navigation";

interface NavbarProps {
  title?: string;
  onOpenSidebar?: () => void;
}

export function Navbar({ title, onOpenSidebar }: NavbarProps) {
  const { user, fullName, initials } = useUser();
  const { logout } = useAuth();

  const router = useRouter();

  const handleLogout = async () => {
    try {
      await logout();
    } catch (error) {
      console.error("Logout error:", error);
    }
  };

  return (
    <header className="bg-[hsl(var(--background))] shadow-sm border-b border-[hsl(var(--border))] sticky top-0 z-40">
      <div className="flex items-center justify-between px-4 sm:px-6 py-3">
        {/* Left Section - Menu Button & Title */}
        <div className="flex items-center gap-2 sm:gap-4">
          {/* Mobile Menu Button */}
          <button
            className="inline-flex items-center justify-center p-2 rounded-md text-[hsl(var(--muted-foreground))] hover:bg-[hsl(var(--muted))] hover:text-[hsl(var(--foreground))] transition-colors md:hidden cursor-pointer"
            onClick={() => onOpenSidebar?.()}
            aria-label="Open sidebar"
          >
            <Menu className="h-5 w-5" />
          </button>

          {/* Title */}
          <div className="flex items-center min-w-0">
            {title && (
              <h1 className="text-lg sm:text-xl font-semibold text-[hsl(var(--foreground))] truncate">
                {title}
              </h1>
            )}
          </div>
        </div>

        {/* Right Section - User Info & Actions */}
        <div className="flex items-center gap-2 sm:gap-4">
          {/* Notifications Icon - Hidden on mobile */}
          <button
            className="hidden sm:flex items-center justify-center p-2 rounded-md text-[hsl(var(--muted-foreground))] hover:bg-[hsl(var(--muted))] hover:text-[hsl(var(--foreground))] transition-colors relative cursor-pointer"
            aria-label="Notifications"
          >
            <Bell className="h-4 w-4" />
            <span className="absolute -top-1 -right-1 w-2 h-2 bg-red-500 rounded-full"></span>
          </button>

          {user && (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button className="flex items-center gap-2 sm:gap-3 p-1 sm:p-2 rounded-lg hover:bg-[hsl(var(--muted))] transition-colors group cursor-pointer">
                  {/* Avatar - Hidden on very small screens */}
                  <div className="hidden xs:flex items-center justify-center w-8 h-8 bg-linear-to-br from-blue-500 to-purple-600 text-white rounded-full text-sm font-medium shadow-sm">
                    {initials}
                  </div>

                  {/* User Info - Hidden on mobile */}
                  <div className="hidden sm:block text-left min-w-0">
                    <div className="font-medium text-[hsl(var(--foreground))] text-sm truncate max-w-[120px]">
                      {fullName}
                    </div>
                    <div className="text-xs text-[hsl(var(--muted-foreground))] capitalize truncate">
                      {user.role}
                    </div>
                  </div>

                  {/* Chevron Icon */}
                  <ChevronDown className="h-4 w-4 text-[hsl(var(--muted-foreground))] group-hover:text-[hsl(var(--foreground))] transition-colors" />
                </button>
              </DropdownMenuTrigger>

              <DropdownMenuContent align="end" className="w-56">
                <DropdownMenuLabel className="flex items-center gap-2">
                  <User className="h-4 w-4" />
                  My Account
                </DropdownMenuLabel>
                <DropdownMenuSeparator />

                <DropdownMenuItem
                  className="flex items-center gap-2 cursor-pointer"
                  onClick={() => router.push("/lms/profile")}
                >
                  <User className="h-4 w-4" />
                  <span>Profile</span>
                </DropdownMenuItem>

                <DropdownMenuItem className="flex items-center gap-2 cursor-pointer">
                  <Settings className="h-4 w-4" />
                  <span>Settings</span>
                </DropdownMenuItem>

                <DropdownMenuSeparator />

                <DropdownMenuItem
                  className="flex items-center gap-2 cursor-pointer text-red-600 focus:text-red-600"
                  onClick={handleLogout}
                >
                  <LogOut className="h-4 w-4" />
                  <span>Logout</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          )}

          {/* Fallback Logout - Only visible when dropdown doesn't work */}
          {user && (
            <Button
              variant="ghost"
              size="sm"
              onClick={handleLogout}
              className="sm:hidden text-[hsl(var(--muted-foreground))] hover:text-[hsl(var(--foreground))]"
            >
              <LogOut className="h-4 w-4" />
            </Button>
          )}
        </div>
      </div>

      {/* Mobile User Info Bar - Only shows on small screens when dropdown is closed */}
      {user && (
        <div className="sm:hidden px-4 py-2 border-t border-[hsl(var(--border))] bg-[hsl(var(--muted))]/30">
          <div className="flex items-center justify-between text-xs">
            <div className="flex items-center gap-2">
              <div className="flex items-center justify-center w-6 h-6 bg-linear-to-br from-blue-500 to-purple-600 text-white rounded-full text-xs font-medium">
                {initials}
              </div>
              <span className="text-[hsl(var(--foreground))] font-medium">
                {fullName}
              </span>
            </div>
            <span className="text-[hsl(var(--muted-foreground))] capitalize">
              {user.role}
            </span>
          </div>
        </div>
      )}
    </header>
  );
}
