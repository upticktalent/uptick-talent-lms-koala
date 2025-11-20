import * as React from "react";
import { cn } from "@/utils/cn";

export interface SkeletonProps extends React.HTMLAttributes<HTMLDivElement> {}

export function Skeleton({ className, ...props }: SkeletonProps) {
  // Use Uptick color tokens (HSL) so dark mode picks the correct color from :root/.dark
  const style: React.CSSProperties = {
    backgroundColor: "hsl(var(--muted))",
  };

  return (
    <div
      aria-hidden
      {...props}
      style={style}
      className={cn("animate-pulse rounded", className)}
    />
  );
}

export default Skeleton;
