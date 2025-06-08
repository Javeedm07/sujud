
"use client";

import { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { verifyPasswordResetCode, confirmPasswordReset } from 'firebase/auth';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { auth } from '@/lib/firebase';
import { Button } from '@/components/ui/button';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import Link from 'next/link';
import { useToast } from '@/hooks/use-toast';
import { Eye, EyeOff } from 'lucide-react';

const passwordResetSchema = z.object({
  newPassword: z.string()
    .min(8, { message: "Password must be at least 8 characters long." })
    .regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.*[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?~])/, {
      message: "Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character."
    }),
  confirmPassword: z.string().min(8, { message: 'Password must be at least 8 characters.' }),
}).refine(data => data.newPassword === data.confirmPassword, {
  message: "Passwords don't match",
  path: ['confirmPassword'],
});

type PasswordResetFormValues = z.infer<typeof passwordResetSchema>;

function ResetPasswordComponent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { toast } = useToast();

  const [oobCode, setOobCode] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [verifyingCode, setVerifyingCode] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [emailForReset, setEmailForReset] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const form = useForm<PasswordResetFormValues>({
    resolver: zodResolver(passwordResetSchema),
    defaultValues: {
      newPassword: '',
      confirmPassword: '',
    },
  });

  useEffect(() => {
    const code = searchParams.get('oobCode');
    if (code) {
      setOobCode(code);
      verifyPasswordResetCode(auth, code)
        .then((email) => {
          setEmailForReset(email);
          setError(null);
        })
        .catch((err) => {
          console.error("Invalid or expired oob code:", err);
          setError('Invalid or expired password reset link. Please try requesting a new one.');
          toast({ variant: 'destructive', title: 'Link Error', description: 'This password reset link is invalid or has expired. Please request a new one.' });
        })
        .finally(() => {
          setVerifyingCode(false);
        });
    } else {
      setError('No password reset code provided. Please use the link from your email.');
      setVerifyingCode(false);
      toast({ variant: 'destructive', title: 'Missing Code', description: 'Password reset code is missing from the link.' });
    }
  }, [searchParams, toast]);

  const handlePasswordReset = async (values: PasswordResetFormValues) => {
    if (!oobCode) {
      setError('Password reset code is missing.');
      toast({ variant: 'destructive', title: 'Error', description: 'Password reset code is missing.' });
      return;
    }
    setLoading(true);
    setError(null);
    setSuccessMessage(null);

    try {
      await confirmPasswordReset(auth, oobCode, values.newPassword);
      setSuccessMessage('Your password has been successfully reset! You can now log in with your new password.');
      toast({ title: 'Password Reset Successful', description: 'You can now log in with your new password.' });
      form.reset();
      // Optionally redirect after a delay
      // setTimeout(() => router.push('/login'), 3000);
    } catch (err: any) {
      console.error('Error resetting password:', err);
      let errorMessage = 'An unexpected error occurred. Please try again.';
      if (err.code === 'auth/weak-password') {
        errorMessage = 'The new password is too weak.';
      } else if (err.code === 'auth/invalid-action-code') {
        errorMessage = 'The password reset link is invalid or has expired. Please request a new one.';
      } else if (err.code === 'auth/user-disabled') {
         errorMessage = 'This account has been disabled.';
      } else if (err.code === 'auth/user-not-found') {
         errorMessage = 'No user found corresponding to this reset code.';
      }
      setError(errorMessage);
      toast({ variant: 'destructive', title: 'Reset Failed', description: errorMessage });
    } finally {
      setLoading(false);
    }
  };

  if (verifyingCode) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#01A6F6] to-[#2D5AFA] p-4">
        <Card className="w-full max-w-md shadow-xl">
          <CardHeader className="text-center">
            <CardTitle className="text-3xl font-headline text-primary">Reset Your Password</CardTitle>
            <CardDescription>Verifying your reset link...</CardDescription>
          </CardHeader>
          <CardContent className="flex justify-center py-10">
             <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (error && !emailForReset) { // If error occurred during verification and email wasn't fetched
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#01A6F6] to-[#2D5AFA] p-4">
        <Card className="w-full max-w-md shadow-xl">
          <CardHeader className="text-center">
            <CardTitle className="text-3xl font-headline text-destructive">Error</CardTitle>
          </CardHeader>
          <CardContent className="text-center">
            <p className="text-destructive-foreground mb-4">{error}</p>
            <Button asChild>
              <Link href="/forgot-password">Request New Reset Link</Link>
            </Button>
          </CardContent>
           <CardFooter className="flex flex-col items-center justify-center pt-6">
            <Link href="/login" passHref>
              <Button variant="link" className="text-sm text-primary hover:underline">
                  Back to Login
              </Button>
            </Link>
          </CardFooter>
        </Card>
      </div>
    );
  }
  
  if (successMessage) {
     return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#01A6F6] to-[#2D5AFA] p-4">
        <Card className="w-full max-w-md shadow-xl">
          <CardHeader className="text-center">
            <CardTitle className="text-3xl font-headline text-primary">Password Reset Successful!</CardTitle>
          </CardHeader>
          <CardContent className="text-center">
            <p className="text-foreground mb-6">{successMessage}</p>
            <Button asChild>
              <Link href="/login">Proceed to Login</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }


  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#01A6F6] to-[#2D5AFA] p-4">
      <Card className="w-full max-w-md shadow-xl">
        <CardHeader className="text-center">
          <CardTitle className="text-3xl font-headline text-primary">
            Reset Your Password
          </CardTitle>
          {emailForReset && <CardDescription>Enter a new password for {emailForReset}.</CardDescription>}
          {!emailForReset && !error && <CardDescription>Enter and confirm your new password.</CardDescription>}
          {error && <CardDescription className="text-destructive">{error}</CardDescription>}
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(handlePasswordReset)} className="space-y-6">
              <FormField
                control={form.control}
                name="newPassword"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>New Password</FormLabel>
                    <FormControl>
                      <div className="relative">
                        <Input
                          type={showPassword ? 'text' : 'password'}
                          placeholder="••••••••"
                          {...field}
                          disabled={loading || !emailForReset}
                        />
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          className="absolute right-1 top-1/2 -translate-y-1/2 h-7 w-7 text-muted-foreground"
                          onClick={() => setShowPassword(!showPassword)}
                          tabIndex={-1}
                        >
                          {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                        </Button>
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="confirmPassword"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Confirm New Password</FormLabel>
                    <FormControl>
                      <div className="relative">
                        <Input
                          type={showConfirmPassword ? 'text' : 'password'}
                          placeholder="••••••••"
                          {...field}
                          disabled={loading || !emailForReset}
                        />
                         <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          className="absolute right-1 top-1/2 -translate-y-1/2 h-7 w-7 text-muted-foreground"
                          onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                          tabIndex={-1}
                        >
                          {showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                        </Button>
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <Button type="submit" className="w-full" disabled={loading || !emailForReset || !!error}>
                {loading ? 'Resetting Password...' : 'Set New Password'}
              </Button>
            </form>
          </Form>
        </CardContent>
         <CardFooter className="flex flex-col items-center justify-center pt-6">
            <Link href="/login" passHref>
             <Button variant="link" className="text-sm text-primary hover:underline">
                Back to Login
              </Button>
          </Link>
        </CardFooter>
      </Card>
    </div>
  );
}


export default function ResetPasswordPage() {
  // Suspense is required by Next.js for pages that use useSearchParams()
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#01A6F6] to-[#2D5AFA] p-4">
        <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-white"></div>
      </div>
    }>
      <ResetPasswordComponent />
    </Suspense>
  );
}


    
