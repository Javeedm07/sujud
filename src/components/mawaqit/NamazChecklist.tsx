
"use client";

import type { ChangeEvent } from 'react';
import React, { useEffect, useState, useCallback } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { getDailyPrayers, updatePrayerStatus, PRAYER_NAMES, getTodayDateString } from '@/lib/firestore';
import type { DailyPrayers, PrayerName, PrayerStatus, PrayerDetails } from '@/lib/types';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Skeleton } from '@/components/ui/skeleton';
import { Moon, Sunrise, Sun, Sunset, CloudSun, Circle, CheckCircle, XCircle } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

const prayerTimeIcons: Record<PrayerName, React.ElementType> = {
  Fajr: Sunrise,
  Dhuhr: Sun,
  Asr: CloudSun,
  Maghrib: Sunset,
  Isha: Moon,
};

const prayerStatusOrder: PrayerStatus[] = ['NOT_MARKED', 'PRAYED', 'NOT_PRAYED'];
const statusTextMap: Record<PrayerStatus, string> = {
  'NOT_MARKED': 'Not Marked',
  'PRAYED': 'Prayed',
  'NOT_PRAYED': 'Not Prayed'
};


interface NamazChecklistProps {
  initialDateString?: string;
}

export default function NamazChecklist({ initialDateString }: NamazChecklistProps) {
  const { user } = useAuth();
  const { toast } = useToast();
  const [prayers, setPrayers] = useState<DailyPrayers | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  const [dateStringForChecklist, setDateStringForChecklist] = useState(initialDateString || getTodayDateString());

  const userName = user?.displayName && user.displayName.toLowerCase() !== 'user' && user.displayName.trim() !== ''
    ? user.displayName
    : 'User';

  const isToday = dateStringForChecklist === getTodayDateString();

  useEffect(() => {
    setDateStringForChecklist(initialDateString || getTodayDateString());
  }, [initialDateString]);

  const fetchPrayers = useCallback(async () => {
    if (!user) return;
    setLoading(true);
    setError(null);
    try {
      const dailyPrayersData = await getDailyPrayers(user.uid, dateStringForChecklist);
      setPrayers(dailyPrayersData);
    } catch (err) {
      console.error("Failed to fetch prayers:", err);
      setError("Could not load salah data. Please try again later.");
      toast({ variant: "destructive", title: "Error", description: "Failed to load salah data." });
    } finally {
      setLoading(false);
    }
  }, [user, dateStringForChecklist, toast]);

  useEffect(() => {
    if (user && dateStringForChecklist) {
      fetchPrayers();
    }
  }, [fetchPrayers, user, dateStringForChecklist]);

  const handlePrayerToggle = async (prayerName: PrayerName) => {
    if (!user || !prayers) return;

    const currentPrayerDetails = prayers[prayerName];
    if (!currentPrayerDetails) return; // Should ideally not happen if prayers are initialized

    const currentStatus = currentPrayerDetails.status;
    const currentIndex = prayerStatusOrder.indexOf(currentStatus);
    const nextIndex = (currentIndex + 1) % prayerStatusOrder.length;
    const newStatus = prayerStatusOrder[nextIndex];

    const originalPrayers = JSON.parse(JSON.stringify(prayers)); // Deep copy for rollback

    setPrayers(prev => {
      if (!prev) return null;
      const updatedPrayer = { 
        ...prev[prayerName], 
        status: newStatus, 
        timestamp: newStatus === 'PRAYED' ? new Date() : null 
      };
      return { ...prev, [prayerName]: updatedPrayer as PrayerDetails };
    });

    try {
      await updatePrayerStatus(user.uid, dateStringForChecklist, prayerName, newStatus);
      toast({
        title: "Salah Updated",
        description: `${prayerName} marked as ${statusTextMap[newStatus].toLowerCase()} for ${new Date(dateStringForChecklist + 'T00:00:00').toLocaleDateString('en-US', { month: 'long', day: 'numeric' })}.`,
      });
    } catch (err) {
      console.error("Failed to update prayer:", err);
      setError(`Failed to update ${prayerName}. Please try again.`);
      toast({ variant: "destructive", title: "Error", description: `Failed to update ${prayerName}.` });
      setPrayers(originalPrayers); // Rollback
    }
  };
  
  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-2xl font-headline text-primary">
            Salah Tracker
          </CardTitle>
          <CardDescription>Loading your salah checklist for {new Date(dateStringForChecklist + 'T00:00:00').toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}...</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {PRAYER_NAMES.map((name) => (
            <div key={name} className="flex items-center justify-between p-3 rounded-md border border-transparent">
              <div className="flex items-center space-x-3">
                <Skeleton className="h-6 w-6 rounded-full" />
                <Skeleton className="h-5 w-20" />
              </div>
              <Skeleton className="h-9 w-9 rounded-full ml-auto" />
            </div>
          ))}
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-2xl font-headline text-destructive">Error</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-destructive-foreground">{error}</p>
          <Button onClick={fetchPrayers} className="mt-4 text-primary hover:underline">Try again</Button>
        </CardContent>
      </Card>
    );
  }
  
  if (!prayers) {
     return (
      <Card>
        <CardHeader>
           <CardTitle className="text-2xl font-headline text-primary">
            Salah Tracker
           </CardTitle>
           <CardDescription>No salah data found for {new Date(dateStringForChecklist + 'T00:00:00').toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}.</CardDescription>
        </CardHeader>
         <CardContent><p>Could not initialize salah data for this day.</p></CardContent>
      </Card>
    );
  }

  return (
    <Card className="bg-card/80 backdrop-blur-sm">
      <CardHeader>
        <CardTitle className="text-2xl font-headline text-primary">
          {isToday ? `Assalam alaikum, ${userName}` : `Salah Tracker`}
        </CardTitle>
        <CardDescription>
          {isToday
            ? `Update your salah for today, ${new Date(dateStringForChecklist + 'T00:00:00').toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}.`
            : `Update your salah for ${new Date(dateStringForChecklist + 'T00:00:00').toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}.`
          }
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-2">
        {PRAYER_NAMES.map((prayerName) => {
          const PrayerTimeIcon = prayerTimeIcons[prayerName];
          const currentPrayerDetails = prayers[prayerName];
          const status = currentPrayerDetails?.status || 'NOT_MARKED';

          let StatusIcon = Circle;
          let iconColorClass = 'text-muted-foreground';
          let rowBgClass = 'bg-card hover:bg-secondary/50';
          let labelClass = 'text-foreground';
          let prayerTimeIconColorClass = 'text-primary/70';

          if (status === 'PRAYED') {
            StatusIcon = CheckCircle;
            iconColorClass = 'text-primary';
            rowBgClass = 'bg-primary/10 border-primary/50';
            labelClass = 'text-primary font-semibold';
            prayerTimeIconColorClass = 'text-primary';
          } else if (status === 'NOT_PRAYED') {
            StatusIcon = XCircle;
            iconColorClass = 'text-destructive';
            rowBgClass = 'bg-destructive/10 border-destructive/50';
            labelClass = 'text-destructive line-through';
            prayerTimeIconColorClass = 'text-destructive/70';
          }

          return (
            <div
              key={prayerName}
              className={`flex items-center justify-between p-3 rounded-lg transition-all duration-300 ease-in-out border ${rowBgClass}`}
            >
              <div className="flex items-center space-x-3">
                <PrayerTimeIcon className={`w-6 h-6 ${prayerTimeIconColorClass}`} />
                <Label htmlFor={`${prayerName}-${dateStringForChecklist}-button`} className={`text-lg ${labelClass}`}>
                  {prayerName}
                </Label>
              </div>
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      id={`${prayerName}-${dateStringForChecklist}-button`}
                      variant="ghost"
                      size="icon"
                      onClick={() => handlePrayerToggle(prayerName)}
                      aria-label={`Current status: ${statusTextMap[status]}. Click to change.`}
                      className={`h-9 w-9 rounded-full ${iconColorClass}`}
                    >
                      <StatusIcon className="h-5 w-5" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Status: {statusTextMap[status]}. Click to change.</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </div>
          );
        })}
      </CardContent>
    </Card>
  );
}
