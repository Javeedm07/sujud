
"use client";

import React, { useEffect, useState, useRef } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { updateProfile } from 'firebase/auth';

import AuthenticatedLayout from '@/components/layout/AuthenticatedLayout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';
import { getUserProfileData, updateUserProfileData } from '@/lib/firestore';
import { uploadProfileImage } from '@/lib/storage'; // Assuming deleteProfileImageByPath might be used later
import type { UserProfileData } from '@/lib/types';
import { Skeleton } from '@/components/ui/skeleton';
import { Trash2 } from 'lucide-react';

const profileFormSchema = z.object({
  displayName: z.string().max(50, { message: "Name can be at most 50 characters."}).optional().or(z.literal('')),
  phoneNumber: z.string().regex(/^$|^[+]?[0-9\s-()]{7,20}$/, { message: "Invalid phone number format." }).optional().or(z.literal('')),
  // photoURL is handled separately via file upload
});

type ProfileFormValues = z.infer<typeof profileFormSchema>;

export default function ProfilePage() {
  const { user, loading: authLoading } = useAuth();
  const { toast } = useToast();
  const [pageLoading, setPageLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isUploadingImage, setIsUploadingImage] = useState(false);

  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewURL, setPreviewURL] = useState<string | null>(null);
  // This flag helps determine if the user explicitly wants to remove the photo,
  // even if no new file is selected.
  const [photoMarkedForRemoval, setPhotoMarkedForRemoval] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);


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
      // Set initial form values
      form.reset({
        displayName: user.displayName === "User" ? "" : user.displayName || '', // If "User", show as empty in form
        // phoneNumber will be set after fetching from Firestore
      });
      // Set initial photo preview
      if (user.photoURL) {
        setPreviewURL(user.photoURL);
      } else {
        setPreviewURL(null);
      }
      setPhotoMarkedForRemoval(false); // Reset on user change

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
      return normalizedName.substring(0, 2).toUpperCase();
    }
    if (email) return email.substring(0, 2).toUpperCase();
    return "U"; // Default for "User", empty name, or no email
  };
  
  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) { // 5MB limit
        toast({ variant: 'destructive', title: 'File too large', description: 'Profile picture cannot exceed 5MB.' });
        return;
      }
      setSelectedFile(file);
      setPreviewURL(URL.createObjectURL(file));
      setPhotoMarkedForRemoval(false); // A new file is selected, so not removing
    }
  };

  const handleRemovePhoto = () => {
    setSelectedFile(null);
    setPreviewURL(null);
    setPhotoMarkedForRemoval(true); // Explicitly mark photo for removal
    if (fileInputRef.current) {
      fileInputRef.current.value = ""; // Clear the file input
    }
  };

  const onSubmit = async (data: ProfileFormValues) => {
    if (!user) {
      toast({ variant: 'destructive', title: 'Error', description: 'You must be logged in to update your profile.' });
      return;
    }
    setIsSubmitting(true);
    setIsUploadingImage(false);

    let newPhotoURL: string | null = user.photoURL; // Start with the current photo URL

    if (selectedFile) {
      setIsUploadingImage(true);
      try {
        newPhotoURL = await uploadProfileImage(user.uid, selectedFile);
        setPreviewURL(newPhotoURL); // Update preview to the uploaded one
      } catch (uploadError: any) {
        toast({ variant: 'destructive', title: 'Image Upload Failed', description: uploadError.message });
        setIsSubmitting(false);
        setIsUploadingImage(false);
        return;
      }
      setIsUploadingImage(false);
    } else if (photoMarkedForRemoval) {
      newPhotoURL = null; // User wants to remove the photo
    }

    // Handle display name: default to "User" if empty
    const finalDisplayName = (data.displayName?.trim() === '') ? 'User' : data.displayName;

    try {
      const authUpdates: { displayName?: string | null; photoURL?: string | null } = {};
      
      if (finalDisplayName !== user.displayName) {
        authUpdates.displayName = finalDisplayName;
      }
      // Only update photoURL if it has actually changed from the current user.photoURL
      // or if it was explicitly marked for removal (newPhotoURL would be null)
      if (newPhotoURL !== user.photoURL) {
         authUpdates.photoURL = newPhotoURL;
      }


      if (Object.keys(authUpdates).length > 0) {
        await updateProfile(user, authUpdates);
      }

      // Update Firestore profile data (phoneNumber)
      const firestoreUpdates: Partial<UserProfileData> = {};
      const currentFirestoreProfile = await getUserProfileData(user.uid);
      if (data.phoneNumber !== (currentFirestoreProfile?.phoneNumber || '')) {
        firestoreUpdates.phoneNumber = data.phoneNumber || '';
      }
      
      if (Object.keys(firestoreUpdates).length > 0) {
          await updateUserProfileData(user.uid, firestoreUpdates);
      }

      toast({ title: 'Success', description: 'Profile updated successfully.' });
      setSelectedFile(null); // Clear selected file after successful upload
      setPhotoMarkedForRemoval(false); // Reset removal flag
      // To reflect changes in header immediately, AuthContext might need a way to refresh user
      // or rely on onAuthStateChanged to pick up auth profile changes.
      // For now, a page reload or re-navigation would show updated header avatar.
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
              <Skeleton className="h-32 w-32 rounded-full mx-auto mb-4" /> {/* Adjusted for larger avatar */}
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
                        <AvatarImage src={previewURL || undefined} alt={watchedDisplayName || user.displayName || user.email || "User"} />
                        <AvatarFallback>{getInitials(user.email, watchedDisplayName || user.displayName)}</AvatarFallback>
                    </Avatar>
                    <input
                        type="file"
                        accept="image/*"
                        onChange={handleFileChange}
                        className="hidden"
                        ref={fileInputRef}
                        id="profilePhotoInput"
                        disabled={isSubmitting || isUploadingImage}
                    />
                    <div className="flex space-x-2">
                        <Button type="button" variant="outline" onClick={() => fileInputRef.current?.click()} disabled={isSubmitting || isUploadingImage}>
                            {isUploadingImage ? 'Uploading...' : (previewURL ? 'Change Photo' : 'Upload Photo')}
                        </Button>
                        {previewURL && (
                            <Button type="button" variant="ghost" size="icon" onClick={handleRemovePhoto} disabled={isSubmitting || isUploadingImage} aria-label="Remove photo">
                                <Trash2 className="h-5 w-5 text-destructive" />
                            </Button>
                        )}
                    </div>
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
                <Button type="submit" disabled={isSubmitting || isUploadingImage}>
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
