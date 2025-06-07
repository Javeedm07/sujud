
"use client";

import type { ReactNode } from 'react';
import { AuthProvider } from '@/context/AuthContext';
import { Toaster } from '@/components/ui/toaster';
// ThemeProvider is removed from here as it's now in RootLayout

export default function AppProviders({ children }: { children: ReactNode }) {
  return (
    <AuthProvider>
      {/* ThemeProvider was here, now removed */}
      {children}
      <Toaster />
    </AuthProvider>
  );
}
