
"use client";

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { createUserWithEmailAndPassword, updateProfile } from 'firebase/auth';
import { z } from 'zod';
import { auth } from '@/lib/firebase';
import { updateUserProfileData } from '@/lib/firestore';
import AuthForm from '@/components/mawaqit/AuthForm';
import { useToast } from '@/hooks/use-toast';

const signupSchema = z.object({
  name: z.string().min(2, { message: 'Name must be at least 2 characters.' }).max(50, {message: 'Name can be at most 50 characters.'}),
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
      const user = userCredential.user;
      
      // Update Firebase Auth display name
      await updateProfile(user, { displayName: values.name });
      
      // Update Firestore user profile data with name and email
      await updateUserProfileData(user.uid, { displayName: values.name, email: user.email || values.email });

      toast({ title: 'Success', description: 'Account created successfully.' });
      router.push('/home'); // Redirect to /home
    } catch (error: any) {
      toast({ variant: 'destructive', title: 'Signup Failed', description: error.message });
      console.error('Signup error:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthForm
      formSchema={signupSchema}
      onSubmit={handleEmailSignup}
      mode="signup"
      loading={loading}
    />
  );
}
