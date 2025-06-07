
"use client";

import type { ReactNode } from 'react';
import React, { createContext, useEffect, useState, useCallback } from 'react';
import { onAuthStateChanged, User as FirebaseUser, signOut as firebaseSignOut } from 'firebase/auth';
import { auth } from '@/lib/firebase';
import type { User } from '@/lib/types';
import { useRouter, usePathname } from 'next/navigation';
import FullScreenLoader from '@/components/layout/FullScreenLoader'; // Import the loader

export interface AuthContextType {
  user: User | null;
  loading: boolean;
  signOut: () => Promise<void>;
  setUser: React.Dispatch<React.SetStateAction<User | null>>; // Expose setUser
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

  const performSignOut = useCallback(async () => {
    try {
      await firebaseSignOut(auth);
      setUser(null); 
      router.push('/'); 
    } catch (error) {
      console.error("Error signing out: ", error);
    }
  }, [router]);

  useEffect(() => {
    if (loading) return; 

    const isAuthPage = pathname === '/login' || pathname === '/signup';
    const isLandingPage = pathname === '/';

    if (user) { 
      if (isAuthPage) { // Only redirect from auth pages if logged in
        router.push('/home'); 
      }
    } else { 
      if (!isLandingPage && !isAuthPage) {
        router.push('/login');
      }
    }
  }, [user, loading, router, pathname]);


  if (loading) {
    return <FullScreenLoader message="Loading session..." />;
  }

  const isAuthPageForRender = pathname === '/login' || pathname === '/signup';
  const isLandingPageForRender = pathname === '/';

  if (user) {
    // If user is logged in AND on an auth page, show loading/redirecting message
    if (isAuthPageForRender) { 
      return <FullScreenLoader message="Redirecting to SUJUD..." />;
    }
  } else { 
    // If user is NOT logged in AND NOT on landing/auth page, show loading/redirecting
    if (!isLandingPageForRender && !isAuthPageForRender) {
      return <FullScreenLoader message="Redirecting to login..." />;
    }
  }
  
  return <AuthContext.Provider value={{ user, loading, signOut: performSignOut, setUser }}>{children}</AuthContext.Provider>;
};
