
"use client";

import type { ReactNode } from 'react';
import React, { createContext, useEffect, useState } from 'react';
import { onAuthStateChanged, User as FirebaseUser, signOut as firebaseSignOut } from 'firebase/auth';
import { auth } from '@/lib/firebase';
import type { User } from '@/lib/types';
import { useRouter, usePathname } from 'next/navigation';

export interface AuthContextType {
  user: User | null;
  loading: boolean;
  signOut: () => Promise<void>;
}

export const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (firebaseUser: FirebaseUser | null) => {
      setUser(firebaseUser as User | null);
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    if (loading) return; // Don't run redirect logic until auth state is determined

    const isAuthPage = pathname === '/login' || pathname === '/signup';
    const isLandingPage = pathname === '/';

    if (user) { // User is logged in
      if (isAuthPage || isLandingPage) {
        router.push('/home'); // Redirect from /login, /signup, or / to /home
      }
      // If user is logged in and on any other authenticated page (e.g., /home, /dashboard), do nothing.
    } else { // User is NOT logged in
      // Unauthenticated users should be able to access landing, login, and signup pages.
      // If they are on any other page, redirect them to login.
      if (!isLandingPage && !isAuthPage) {
        router.push('/login');
      }
      // If on landing, login, or signup page, do nothing and allow access.
    }
  }, [user, loading, router, pathname]);


  // Handle rendering based on auth state and current path to show loading/redirecting messages
  if (loading) {
    return <div className="flex items-center justify-center min-h-screen bg-background"><p>Loading session...</p></div>;
  }

  const isAuthPageForRender = pathname === '/login' || pathname === '/signup';
  const isLandingPageForRender = pathname === '/';

  if (user) { // User is logged in
    if (isAuthPageForRender || isLandingPageForRender) {
      // useEffect will redirect. Show a placeholder message.
      return <div className="flex items-center justify-center min-h-screen bg-background"><p>Redirecting to Mawaqit...</p></div>;
    }
  } else { // User is not logged in
    // If on a protected page (not landing, login, or signup), show redirecting message
    if (!isLandingPageForRender && !isAuthPageForRender) {
      // useEffect will redirect. Show a placeholder message.
      return <div className="flex items-center justify-center min-h-screen bg-background"><p>Redirecting to login...</p></div>;
    }
  }

  // If no redirect is imminent or user is on an allowed page, render the children
  return <AuthContext.Provider value={{ user, loading, signOut }}>{children}</AuthContext.Provider>;
};

