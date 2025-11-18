import * as React from "react";
import { cn } from "@/utils/cn";

export interface InputProps
  extends React.InputHTMLAttributes<HTMLInputElement> {}

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, type, ...props }, ref) => {
    const style: React.CSSProperties = {
      backgroundColor: "var(--color-input)",
      borderColor: "var(--color-border)",
      color: "var(--color-foreground)",
    };

    return (
      <input
        type={type}
        style={style}
        className={cn(
          // Theme-aware Input Styles
          "flex h-12 w-full rounded-lg border px-4 py-3 text-base transition-all duration-200",
          "bg-input border-border text-foreground",
          "placeholder:text-muted-foreground",
          "focus:border-primary focus:ring-1 focus:ring-primary focus:outline-none",
          "file:border-0 file:bg-transparent file:text-base file:font-medium file:text-foreground",
          "disabled:cursor-not-allowed disabled:opacity-50",
          "hover:border-primary/50",
          className
        )}
        ref={ref}
        {...props}
      />
    );
  }
);
Input.displayName = "Input";

export { Input };
