
"use client";

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { createUserWithEmailAndPassword, updateProfile } from 'firebase/auth';
import { z } from 'zod';
import { auth } from '@/lib/firebase';
import { updateUserProfileData } from '@/lib/firestore';
import AuthForm from '@/components/mawaqit/AuthForm';
import { useToast } from '@/hooks/use-toast';
import Link from 'next/link'; // Import Link

const signupSchema = z.object({
  name: z.string().min(2, { message: 'Name must be at least 2 characters.' }).max(50, {message: 'Name can be at most 50 characters.'}),
  email: z.string().email({ message: 'Invalid email address.' }),
  password: z.string()
    .min(8, { message: "Password must be at least 8 characters long." })
    .regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.*[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?~])/, { 
      message: "Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character." 
    }),
  confirmPassword: z.string().min(8, { message: 'Password must be at least 8 characters.' }),
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
      
      await updateProfile(user, { displayName: values.name });
      
      await updateUserProfileData(user.uid, { displayName: values.name, email: user.email || values.email });

      toast({ title: 'Success', description: 'Account created successfully.' });
      router.push('/home'); 
    } catch (error: any) {
      if (error.code === 'auth/email-already-in-use') {
        toast({
          variant: 'destructive',
          title: 'Account Exists',
          description: (
            <span>
              An account with this email already exists. Please{' '}
              <Link href="/login" className="font-medium text-primary hover:underline">
                login to access your account
              </Link>
              . If you've forgotten your password, you can reset it on the login page.
            </span>
          ),
        });
      } else {
        toast({ variant: 'destructive', title: 'Signup Failed', description: error.message });
      }
      // console.error('Signup error:', error); // Removed to prevent Next.js overlay for this handled error
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

