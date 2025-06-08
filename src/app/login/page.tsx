
"use client";

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { signInWithEmailAndPassword } from 'firebase/auth'; 
import { z } from 'zod';
import { auth } from '@/lib/firebase';
import AuthForm from '@/components/mawaqit/AuthForm';
import { useToast } from '@/hooks/use-toast';

const loginSchema = z.object({
  email: z.string().email({ message: 'Invalid email address.' }),
  password: z.string().min(8, { message: 'Password must be at least 8 characters.' }),
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
      router.push('/home'); 
    } catch (error: any) {
      let errorMessage = 'An unexpected error occurred. Please try again.';
      if (error.code === 'auth/invalid-credential' || error.code === 'auth/wrong-password' || error.code === 'auth/user-not-found') {
        errorMessage = 'Incorrect email or password. Please try again.';
      } else if (error.message) {
        errorMessage = error.message;
      }
      toast({ variant: 'destructive', title: 'Login Failed', description: errorMessage });
      // console.error('Login error:', error); // Removed to prevent Next.js overlay for this handled error
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthForm
      formSchema={loginSchema}
      onSubmit={handleEmailLogin}
      mode="login"
      loading={loading}
    />
  );
}
