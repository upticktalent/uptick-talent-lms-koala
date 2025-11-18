import * as React from "react";
import { cn } from "@/utils/cn";

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "danger" | "ghost" | "link" | "outline";
  size?: "default" | "sm" | "lg" | "icon";
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = "primary", size = "default", ...props }, ref) => {
    // Inline style fallbacks using CSS variables defined in globals.css
    const variantStyle: React.CSSProperties =
      variant === "primary"
        ? {
            backgroundColor: "var(--color-primary)",
            color: "var(--color-primary-foreground)",
            borderColor: "transparent",
          }
        : variant === "secondary"
        ? {
            backgroundColor: "transparent",
            color: "var(--color-primary)",
            borderColor: "var(--color-primary)",
          }
        : variant === "danger"
        ? {
            backgroundColor: "var(--color-destructive)",
            color: "var(--color-destructive-foreground)",
            borderColor: "transparent",
          }
        : variant === "ghost"
        ? {
            backgroundColor: "transparent",
            color: "var(--color-muted-foreground)",
            borderColor: "transparent",
          }
        : variant === "outline"
        ? {
            backgroundColor: "transparent",
            color: "var(--color-foreground)",
            borderColor: "var(--color-border)",
          }
        : {
            backgroundColor: "transparent",
            color: "var(--color-primary)",
            borderColor: "transparent",
          };
    return (
      <button
        style={variantStyle}
        className={cn(
          "inline-flex items-center justify-center whitespace-nowrap font-medium transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50",
          {
            // Primary Button - Theme Aware
            "bg-primary text-primary-foreground rounded-xl hover:bg-primary/90 focus:ring-2 focus:ring-primary focus:ring-offset-2 focus:ring-offset-background disabled:opacity-50":
              variant === "primary",
            // Secondary Button - Theme Aware
            "border border-primary text-primary bg-transparent rounded-xl hover:bg-primary hover:text-primary-foreground focus:ring-2 focus:ring-primary focus:ring-offset-2":
              variant === "secondary",
            // Danger Button - Theme Aware
            "bg-destructive text-destructive-foreground rounded-xl hover:bg-destructive/90 focus:ring-2 focus:ring-destructive focus:ring-offset-2 disabled:opacity-50":
              variant === "danger",
            // Ghost Button - Theme Aware
            "text-muted-foreground hover:bg-accent hover:text-accent-foreground rounded-xl":
              variant === "ghost",
            // Link Button - Theme Aware
            "text-primary underline-offset-4 hover:underline rounded-xl":
              variant === "link",
            // Outline Button - Theme Aware
            "border border-[hsl(var(--border))] text-[hsl(var(--foreground))] bg-transparent rounded-xl hover:bg-[hsl(var(--muted))] hover:text-[hsl(var(--foreground))] focus:ring-2 focus:ring-primary focus:ring-offset-2":
              variant === "outline",
          },
          {
            // Uptick Design System Sizing
            "h-12 px-5 py-3 text-base": size === "default",
            "h-10 px-4 py-2 text-sm": size === "sm",
            "h-14 px-8 py-4 text-lg": size === "lg",
            "h-12 w-12 p-0": size === "icon",
          },
          className
        )}
        ref={ref}
        {...props}
      />
    );
  }
);
Button.displayName = "Button";

export { Button };
