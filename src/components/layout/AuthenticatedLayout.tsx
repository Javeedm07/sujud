
"use client";

import type { ReactNode } from 'react';
import Header from './Header';
import { useAuth } from '@/hooks/useAuth';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import FullScreenLoader from './FullScreenLoader'; // Import the loader

export default function AuthenticatedLayout({ children }: { children: ReactNode }) {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && !user) {
      router.push('/login');
    }
  }, [user, loading, router]);

  if (loading || !user) {
    // Use FullScreenLoader for the loading state
    return <FullScreenLoader message="Loading user data..." />;
  }

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Header />
      <main className="flex-grow container mx-auto px-4 py-8">
        {children}
      </main>
      <footer className="py-6 text-center text-muted-foreground text-sm">
        © {new Date().getFullYear()} SUJUD. All rights reserved.
      </footer>
    </div>
  );
}
