
"use client";

import React, { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { updateProfile } from 'firebase/auth';
import { auth } from '@/lib/firebase';

import AuthenticatedLayout from '@/components/layout/AuthenticatedLayout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';
import { getUserProfileData, updateUserProfileData } from '@/lib/firestore';
import type { UserProfileData, User } from '@/lib/types';
import { Skeleton } from '@/components/ui/skeleton';

const profileFormSchema = z.object({
  displayName: z.string().max(50, { message: "Name can be at most 50 characters."}).optional().or(z.literal('')),
  phoneNumber: z.string().regex(/^$|^[+]?[0-9\s-()]{7,20}$/, { message: "Invalid phone number format." }).optional().or(z.literal('')),
});

type ProfileFormValues = z.infer<typeof profileFormSchema>;

export default function ProfilePage() {
  const { user, loading: authLoading, setUser } = useAuth();
  const { toast } = useToast();
  const [pageLoading, setPageLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<ProfileFormValues>({
    resolver: zodResolver(profileFormSchema),
    defaultValues: {
      displayName: '',
      phoneNumber: '',
    },
  });

  useEffect(() => {
    if (user) {
      setPageLoading(true);
      form.reset({
        displayName: user.displayName === "User" ? "" : user.displayName || '',
      });
      
      getUserProfileData(user.uid)
        .then((profileData) => {
          if (profileData) {
            form.setValue('phoneNumber', profileData.phoneNumber || '');
          }
        })
        .catch((error) => {
          console.error("Error fetching profile data: ", error);
          toast({ variant: 'destructive', title: 'Error', description: 'Could not load profile details.' });
        })
        .finally(() => setPageLoading(false));
    } else if (!authLoading) {
      setPageLoading(false);
    }
  }, [user, form, toast, authLoading]);

  const getInitials = (email?: string | null, name?: string | null) => {
    const normalizedName = name?.trim();
    if (normalizedName && normalizedName.toLowerCase() !== "user" && normalizedName !== "") {
      const parts = normalizedName.split(' ');
      if (parts.length > 1) {
        return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
      }
      return normalizedName.substring(0, 2).toUpperCase();
    }
    if (email) return email.substring(0, 2).toUpperCase();
    return "U"; 
  };
  
  const onSubmit = async (data: ProfileFormValues) => {
    if (!user) {
      toast({ variant: 'destructive', title: 'Error', description: 'You must be logged in to update your profile.' });
      return;
    }
    setIsSubmitting(true);

    const finalDisplayName = (data.displayName?.trim() === '') ? 'User' : data.displayName;

    try {
      const authUpdates: { displayName?: string | null; photoURL?: string | null } = {
        photoURL: null // Always set photoURL to null
      };
      
      if (finalDisplayName !== user.displayName) {
        authUpdates.displayName = finalDisplayName;
      }
      // Check if photoURL is already null, to avoid unnecessary update if no display name change
      if (finalDisplayName !== user.displayName || user.photoURL !== null) {
         await updateProfile(user, authUpdates);
      }


      const firestoreUpdates: Partial<UserProfileData> = {};
      const currentFirestoreProfile = await getUserProfileData(user.uid);
      if (data.phoneNumber !== (currentFirestoreProfile?.phoneNumber || '')) {
        firestoreUpdates.phoneNumber = data.phoneNumber || '';
      }
      
      if (Object.keys(firestoreUpdates).length > 0) {
          await updateUserProfileData(user.uid, firestoreUpdates);
      }
      
      if (auth.currentUser) {
        setUser({ ...auth.currentUser } as User); 
      }

      toast({ title: 'Success', description: 'Profile updated successfully.' });
    } catch (error: any) {
      console.error('Profile update error:', error);
      toast({ variant: 'destructive', title: 'Update Failed', description: error.message });
    } finally {
      setIsSubmitting(false);
    }
  };
  
  const watchedDisplayName = form.watch('displayName');

  if (authLoading || pageLoading) {
    return (
      <AuthenticatedLayout>
        <div className="space-y-6 max-w-2xl mx-auto">
          <Skeleton className="h-10 w-1/3" />
          <Skeleton className="h-6 w-2/3 mb-8" />
          <Card>
            <CardHeader className="items-center">
              <Skeleton className="h-32 w-32 rounded-full mx-auto mb-4" />
              <Skeleton className="h-6 w-1/2 mx-auto" />
              <Skeleton className="h-4 w-3/4 mx-auto" />
            </CardHeader>
            <CardContent className="space-y-6">
              <div>
                <Skeleton className="h-5 w-1/4 mb-2" />
                <Skeleton className="h-10 w-full" />
              </div>
              <div>
                <Skeleton className="h-5 w-1/4 mb-2" />
                <Skeleton className="h-10 w-full" />
              </div>
            </CardContent>
            <CardFooter>
              <Skeleton className="h-10 w-24" />
            </CardFooter>
          </Card>
        </div>
      </AuthenticatedLayout>
    );
  }
  
  if (!user) {
     return (
      <AuthenticatedLayout>
        <p className="text-center">Please log in to view your profile.</p>
      </AuthenticatedLayout>
    );
  }

  return (
    <AuthenticatedLayout>
      <div className="space-y-6 max-w-2xl mx-auto">
        <div>
          <h1 className="text-3xl font-bold font-headline text-primary">Your Profile</h1>
          <p className="text-muted-foreground">
            Manage your account details and preferences.
          </p>
        </div>

        <Card className="shadow-lg">
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)}>
              <CardHeader className="items-center">
                <div className="flex flex-col items-center space-y-4">
                    <Avatar className="h-32 w-32 text-4xl mb-2">
                        <AvatarImage src={undefined} alt={watchedDisplayName || user.displayName || user.email || "User"} />
                        <AvatarFallback>{getInitials(user.email, watchedDisplayName || user.displayName)}</AvatarFallback>
                    </Avatar>
                </div>
                <CardTitle className="text-2xl mt-4">{watchedDisplayName || user.displayName || 'User'}</CardTitle>
                <CardDescription>{user.email}</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <FormField
                  control={form.control}
                  name="displayName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Full Name</FormLabel>
                      <FormControl>
                        <Input placeholder="Enter your full name (leave blank for 'User')" {...field} value={field.value || ''} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="phoneNumber"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Mobile Number</FormLabel>
                      <FormControl>
                        <Input placeholder="Enter your mobile number (e.g., +1 123 456 7890)" {...field} value={field.value || ''} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </CardContent>
              <CardFooter>
                <Button type="submit" disabled={isSubmitting}>
                  {isSubmitting ? 'Saving...' : 'Save Changes'}
                </Button>
              </CardFooter>
            </form>
          </Form>
        </Card>
      </div>
    </AuthenticatedLayout>
  );
}

