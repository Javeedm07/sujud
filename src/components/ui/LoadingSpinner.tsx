
"use client";

import { cn } from "@/lib/utils";

interface LoadingSpinnerProps {
  className?: string;
  size?: "sm" | "md" | "lg";
}

export default function LoadingSpinner({ className, size = "md" }: LoadingSpinnerProps) {
  const sizeClasses = {
    sm: "h-6 w-6 border-2",
    md: "h-12 w-12 border-4",
    lg: "h-16 w-16 border-4",
  };

  return (
    <div
      className={cn(
        "rounded-full border-solid border-primary border-t-transparent animate-spin-slow", // Use animate-spin-slow
        sizeClasses[size],
        className
      )}
      role="status"
      aria-live="polite"
      aria-label="Loading"
    />
  );
}
