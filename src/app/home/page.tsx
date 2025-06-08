
"use client";

import AuthenticatedLayout from '@/components/layout/AuthenticatedLayout';
import NamazChecklist from '@/components/mawaqit/NamazChecklist';
import DailyInspiration from '@/components/mawaqit/DailyInspiration';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { CalendarDays, Share2, Copy } from 'lucide-react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { useState, useEffect } from 'react';

export default function HomePage() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [inviteLinkCopied, setInviteLinkCopied] = useState(false);
  const [baseUrl, setBaseUrl] = useState('');

  useEffect(() => {
    if (typeof window !== 'undefined') {
      setBaseUrl(window.location.origin);
    }
  }, []);

  const userName = user?.displayName && user.displayName.toLowerCase() !== 'user' && user.displayName.trim() !== '' 
    ? user.displayName 
    : 'User';

  const handleCopyInviteLink = () => {
    if (!baseUrl) {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Could not determine invite link.',
      });
      return;
    }
    const inviteLink = `${baseUrl}/`; // Link to the landing page
    navigator.clipboard.writeText(inviteLink)
      .then(() => {
        toast({
          title: 'Link Copied!',
          description: 'Invite link copied to clipboard.',
        });
        setInviteLinkCopied(true);
        setTimeout(() => setInviteLinkCopied(false), 2000); // Reset after 2 seconds
      })
      .catch(err => {
        console.error('Failed to copy invite link: ', err);
        toast({
          variant: 'destructive',
          title: 'Failed to Copy',
          description: 'Could not copy link to clipboard.',
        });
      });
  };

  return (
    <AuthenticatedLayout>
      <div className="mb-6 flex flex-row justify-between items-center gap-4">
        <h1 className="text-3xl font-bold font-headline text-primary">
          Assalam alaikum, {userName}
        </h1>
        <Button variant="outline" asChild>
          <Link href="/prayer-history" className="flex items-center">
            <CalendarDays size={20} />
          </Link>
        </Button>
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <NamazChecklist />
        </div>
        <div className="space-y-6">
          <DailyInspiration />
          <Card className="bg-card/80 backdrop-blur-sm transform hover:scale-[1.01] transition-transform duration-300 ease-out">
            <CardHeader>
              <CardTitle className="text-xl font-headline text-primary flex items-center gap-2">
                <Share2 size={24} /> Invite Friends & Family
              </CardTitle>
              <CardDescription>
                Share SUJUD to help others on their prayer journey. Click the button below to copy the invite link.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button onClick={handleCopyInviteLink} className="w-full" variant="outline">
                {inviteLinkCopied ? (
                  <>
                    <Copy size={18} className="mr-2" /> Copied!
                  </>
                ) : (
                  <>
                    <Copy size={18} className="mr-2" /> Copy Invite Link
                  </>
                )}
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </AuthenticatedLayout>
  );
}
