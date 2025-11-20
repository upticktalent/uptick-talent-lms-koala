import * as React from "react";
import { cn } from "@/utils/cn";

export interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: "default" | "destructive" | "secondary" | "outline";
}

export function Badge({
  variant = "default",
  className,
  children,
  ...props
}: BadgeProps) {
  // Use Uptick color system CSS variables defined in `app/globals.css`.
  const style: React.CSSProperties =
    variant === "destructive"
      ? {
          backgroundColor: "hsl(var(--destructive))",
          color: "hsl(var(--destructive-foreground))",
          border: "1px solid hsl(var(--border))",
        }
      : variant === "secondary"
      ? {
          backgroundColor: "hsl(var(--secondary))",
          color: "hsl(var(--secondary-foreground))",
          border: "1px solid hsl(var(--border))",
        }
      : variant === "outline"
      ? {
          backgroundColor: "transparent",
          color: "hsl(var(--foreground))",
          border: "1px solid hsl(var(--border))",
        }
      : {
          backgroundColor: "hsl(var(--primary))",
          color: "hsl(var(--primary-foreground))",
          border: "1px solid transparent",
        };

  return (
    <span
      {...props}
      style={style}
      className={cn(
        "inline-flex items-center px-2 py-0.5 rounded text-xs font-medium",
        className
      )}
    >
      {children}
    </span>
  );
}

export default Badge;
