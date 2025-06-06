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
    if (loading) return;

    const isAuthPage = pathname === '/login' || pathname === '/signup';

    if (!user && !isAuthPage) {
      router.push('/login');
    } else if (user && isAuthPage) {
      router.push('/');
    }
  }, [user, loading, router, pathname]);


  const signOut = async () => {
    try {
      await firebaseSignOut(auth);
      setUser(null);
      router.push('/login');
    } catch (error) {
      console.error("Error signing out: ", error);
    }
  };

  const value = { user, loading, signOut };

  if (loading && (pathname !== '/login' && pathname !== '/signup')) {
     // Full screen loader can be added here
    return <div className="flex items-center justify-center min-h-screen bg-background"><p>Loading...</p></div>;
  }
  
  // Prevent rendering children on auth pages if user is already determined or loading auth state for non-auth pages
  if (loading && (pathname === '/login' || pathname === '/signup')) {
    return <div className="flex items-center justify-center min-h-screen bg-background"><p>Loading...</p></div>;
  }

  if (!loading && !user && pathname !== '/login' && pathname !== '/signup') {
    return <div className="flex items-center justify-center min-h-screen bg-background"><p>Redirecting to login...</p></div>;
  }
  
  if (!loading && user && (pathname === '/login' || pathname === '/signup')) {
     return <div className="flex items-center justify-center min-h-screen bg-background"><p>Redirecting to dashboard...</p></div>;
  }


  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
