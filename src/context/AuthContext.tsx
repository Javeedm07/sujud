
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

    const publicPaths = ['/', '/login', '/signup']; // Landing page '/' is now public
    const isAuthPage = pathname === '/login' || pathname === '/signup';
    const isPublicPath = publicPaths.includes(pathname);

    if (user) { // User is logged in
      if (isAuthPage) {
        router.push('/home'); // Redirect from /login or /signup to /home
      } else if (pathname === '/') {
        router.push('/home'); // Redirect from landing page to /home if logged in
      }
      // If user is logged in and on any other authenticated page (e.g., /home, /dashboard), do nothing.
    } else { // User is NOT logged in
      if (!isPublicPath) {
        router.push('/login'); // If on a protected page, redirect to /login
      }
      // If user is not logged in and on a public path (/, /login, /signup), do nothing.
    }
  }, [user, loading, router, pathname]);


  const signOut = async () => {
    try {
      await firebaseSignOut(auth);
      setUser(null); // Explicitly set user to null
      router.push('/login'); // Redirect to login page after sign out
    } catch (error) {
      console.error("Error signing out: ", error);
    }
  };

  const value = { user, loading, signOut };

  // Handle rendering based on auth state and current path
  if (loading) {
    return <div className="flex items-center justify-center min-h-screen bg-background"><p>Loading session...</p></div>;
  }

  const publicPaths = ['/', '/login', '/signup'];
  const isAuthPage = pathname === '/login' || pathname === '/signup';

  if (user) { // User is logged in
    if (isAuthPage || pathname === '/') {
      // useEffect will redirect. Show a placeholder message.
      return <div className="flex items-center justify-center min-h-screen bg-background"><p>Redirecting to Mawaqit...</p></div>;
    }
  } else { // User is not logged in
    if (!publicPaths.includes(pathname)) {
      // useEffect will redirect. Show a placeholder message.
      return <div className="flex items-center justify-center min-h-screen bg-background"><p>Redirecting to login...</p></div>;
    }
  }

  // If no redirect is imminent, render the children with the context
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
