"use client";

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { signInWithEmailAndPassword, GoogleAuthProvider, signInWithPopup } from 'firebase/auth';
import { z } from 'zod';
import { auth } from '@/lib/firebase';
import AuthForm from '@/components/mawaqit/AuthForm';
import { useToast } from '@/hooks/use-toast';

const loginSchema = z.object({
  email: z.string().email({ message: 'Invalid email address.' }),
  password: z.string().min(6, { message: 'Password must be at least 6 characters.' }),
});

export default function LoginPage() {
  const router = useRouter();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);

  const handleEmailLogin = async (values: z.infer<typeof loginSchema>) => {
    setLoading(true);
    try {
      await signInWithEmailAndPassword(auth, values.email, values.password);
      toast({ title: 'Success', description: 'Logged in successfully.' });
      router.push('/');
    } catch (error: any) {
      toast({ variant: 'destructive', title: 'Login Failed', description: error.message });
      console.error('Login error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    setLoading(true);
    const provider = new GoogleAuthProvider();
    try {
      await signInWithPopup(auth, provider);
      toast({ title: 'Success', description: 'Logged in with Google successfully.' });
      router.push('/');
    } catch (error: any) {
      toast({ variant: 'destructive', title: 'Google Sign-In Failed', description: error.message });
      console.error('Google sign-in error:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthForm
      formSchema={loginSchema}
      onSubmit={handleEmailLogin}
      onGoogleSignIn={handleGoogleSignIn}
      mode="login"
      loading={loading}
    />
  );
}
