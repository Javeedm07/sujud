
"use client";

import type { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
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
import { Separator } from '../ui/separator';

interface AuthFormProps {
  formSchema: z.ZodSchema<any>;
  onSubmit: (values: z.infer<any>) => Promise<void>;
  onGoogleSignIn: () => Promise<void>;
  mode: 'login' | 'signup';
  loading: boolean;
}

export default function AuthForm({ formSchema, onSubmit, onGoogleSignIn, mode, loading }: AuthFormProps) {
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: mode === 'signup' ? { email: '', password: '', confirmPassword: '' } : { email: '', password: '' },
  });

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary/20 via-background to-accent/20 p-4">
      <Card className="w-full max-w-md shadow-xl">
        <CardHeader className="text-center">
          <CardTitle className="text-3xl font-headline text-primary">
            {mode === 'login' ? 'Welcome Back' : 'Create Account'}
          </CardTitle>
          <CardDescription>
            {mode === 'login' ? 'Sign in to access SUJUD' : 'Join SUJUD to track your prayers'}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Email</FormLabel>
                    <FormControl>
                      <Input placeholder="your.email@example.com" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="password"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Password</FormLabel>
                    <FormControl>
                      <Input type="password" placeholder="••••••••" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              {mode === 'signup' && (
                <FormField
                  control={form.control}
                  name="confirmPassword"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Confirm Password</FormLabel>
                      <FormControl>
                        <Input type="password" placeholder="••••••••" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              )}
              <Button type="submit" className="w-full" disabled={loading}>
                {loading ? 'Processing...' : (mode === 'login' ? 'Login' : 'Sign Up')}
              </Button>
            </form>
          </Form>
          <Separator className="my-6" />
          <Button variant="outline" className="w-full flex items-center gap-2" onClick={onGoogleSignIn} disabled={loading}>
            <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M22.578 12.282c0-.818-.072-1.58-.21-2.364H12v4.46h5.928a5.075 5.075 0 01-2.208 3.306v2.898h3.718c2.175-2.002 3.43-4.944 3.43-8.3z" fill="#4285F4"></path><path d="M12 23c3.24 0 5.952-1.074 7.938-2.91L16.22 17.2c-1.074.72-2.448 1.152-4.22 1.152-3.24 0-6-2.178-7.002-5.094H1.278v2.898C3.24 19.95 7.278 23 12 23z" fill="#34A853"></path><path d="M4.998 13.266a7.403 7.403 0 010-4.53V5.838H1.278a11.91 11.91 0 000 10.326l3.72-2.9z" fill="#FBBC05"></path><path d="M12 4.644c1.746 0 3.342.6 4.596 1.782L19.5 3.522C17.46.864 14.952 0 12 0 7.278 0 3.24 3.048 1.278 7.002l3.72 2.898C6 7.002 8.76 4.644 12 4.644z" fill="#EA4335"></path></svg>
            Sign {mode === 'login' ? 'in' : 'up'} with Google
          </Button>
        </CardContent>
        <CardFooter className="justify-center">
          {mode === 'login' ? (
            <p className="text-sm text-muted-foreground">
              Don&apos;t have an account?{' '}
              <Link href="/signup" className="font-medium text-primary hover:underline">
                Sign up
              </Link>
            </p>
          ) : (
            <p className="text-sm text-muted-foreground">
              Already have an account?{' '}
              <Link href="/login" className="font-medium text-primary hover:underline">
                Login
              </Link>
            </p>
          )}
        </CardFooter>
      </Card>
    </div>
  );
}
