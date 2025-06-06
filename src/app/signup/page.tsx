
"use client";

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { createUserWithEmailAndPassword, GoogleAuthProvider, signInWithPopup, updateProfile } from 'firebase/auth';
import { z } from 'zod';
import { auth } from '@/lib/firebase';
import AuthForm from '@/components/mawaqit/AuthForm';
import { useToast } from '@/hooks/use-toast';

const signupSchema = z.object({
  email: z.string().email({ message: 'Invalid email address.' }),
  password: z.string().min(6, { message: 'Password must be at least 6 characters.' }),
  confirmPassword: z.string().min(6, { message: 'Password must be at least 6 characters.' }),
}).refine(data => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ['confirmPassword'],
});

export default function SignupPage() {
  const router = useRouter();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);

  const handleEmailSignup = async (values: z.infer<typeof signupSchema>) => {
    setLoading(true);
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, values.email, values.password);
      // You can set a display name here if you have a field for it
      // await updateProfile(userCredential.user, { displayName: "Some Name" });
      toast({ title: 'Success', description: 'Account created successfully.' });
      router.push('/home'); // Redirect to /home
    } catch (error: any) {
      toast({ variant: 'destructive', title: 'Signup Failed', description: error.message });
      console.error('Signup error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    setLoading(true);
    const provider = new GoogleAuthProvider();
    try {
      await signInWithPopup(auth, provider);
      toast({ title: 'Success', description: 'Signed up with Google successfully.' });
      router.push('/home'); // Redirect to /home
    } catch (error: any) {
      toast({ variant: 'destructive', title: 'Google Sign-Up Failed', description: error.message });
      console.error('Google sign-up error:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthForm
      formSchema={signupSchema}
      onSubmit={handleEmailSignup}
      onGoogleSignIn={handleGoogleSignIn}
      mode="signup"
      loading={loading}
    />
  );
}
