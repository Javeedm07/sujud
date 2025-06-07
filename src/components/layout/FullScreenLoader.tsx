
"use client";

import LoadingSpinner from "@/components/ui/LoadingSpinner";

interface FullScreenLoaderProps {
  message?: string;
}

export default function FullScreenLoader({ message = "Loading..." }: FullScreenLoaderProps) {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-background text-center p-4">
      <LoadingSpinner size="lg" />
      {message && (
        <p className="mt-6 text-lg text-muted-foreground animate-pulse">
          {message}
        </p>
      )}
    </div>
  );
}
