
"use client";

import type { ReactNode } from 'react';
import React, { createContext, useEffect, useState, useCallback } from 'react';
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

  const signOut = useCallback(async () => {
    try {
      await firebaseSignOut(auth);
      setUser(null); // Clear user state
      router.push('/'); // Redirect to landing page
    } catch (error) {
      console.error("Error signing out: ", error);
      // Optionally, show a toast notification for sign-out errors
    }
  }, [router]);

  useEffect(() => {
    if (loading) return; 

    const isAuthPage = pathname === '/login' || pathname === '/signup';
    const isLandingPage = pathname === '/';

    if (user) { 
      if (isAuthPage || isLandingPage) {
        router.push('/home'); 
      }
    } else { 
      if (!isLandingPage && !isAuthPage) {
        router.push('/login');
      }
    }
  }, [user, loading, router, pathname]);


  if (loading) {
    return <div className="flex items-center justify-center min-h-screen bg-background"><p>Loading session...</p></div>;
  }

  const isAuthPageForRender = pathname === '/login' || pathname === '/signup';
  const isLandingPageForRender = pathname === '/';

  if (user) {
    if (isAuthPageForRender || isLandingPageForRender) {
      return <div className="flex items-center justify-center min-h-screen bg-background"><p>Redirecting to SUJUD...</p></div>;
    }
  } else { 
    if (!isLandingPageForRender && !isAuthPageForRender) {
      // This case means user is not logged in, AND is not on landing/auth page.
      // If they are trying to access a protected route, this will kick in after initial load.
      // The useEffect above handles the redirect earlier, this is a fallback for rendering.
      return <div className="flex items-center justify-center min-h-screen bg-background"><p>Redirecting to login...</p></div>;
    }
  }
  
  return <AuthContext.Provider value={{ user, loading, signOut }}>{children}</AuthContext.Provider>;
};
