
"use client";

import type { ChangeEvent } from 'react';
import React, { useEffect, useState, useCallback } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { getDailyPrayers, updatePrayerStatus, PRAYER_NAMES, getTodayDateString } from '@/lib/firestore';
import type { DailyPrayers, PrayerName } from '@/lib/types';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { Skeleton } from '@/components/ui/skeleton';
import { Moon, Sunrise, Sun, Sunset, CloudSun } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

const prayerIcons: Record<PrayerName, React.ElementType> = {
  Fajr: Sunrise,
  Dhuhr: Sun,
  Asr: CloudSun,
  Maghrib: Sunset,
  Isha: Moon,
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

  const handlePrayerToggle = async (prayerName: PrayerName, checked: boolean) => {
    if (!user || !prayers) return;

    const originalPrayers = { ...prayers };
    setPrayers(prev => prev ? ({
      ...prev,
      [prayerName]: { ...prev[prayerName], completed: checked }
    }) : null);

    try {
      await updatePrayerStatus(user.uid, dateStringForChecklist, prayerName, checked);
      toast({
        title: "Salah Updated",
        description: `${prayerName} marked as ${checked ? 'completed' : 'pending'} for ${new Date(dateStringForChecklist).toLocaleDateString('en-US', { month: 'long', day: 'numeric' })}.`,
      });
    } catch (err) {
      console.error("Failed to update prayer:", err);
      setError(`Failed to update ${prayerName}. Please try again.`);
      toast({ variant: "destructive", title: "Error", description: `Failed to update ${prayerName}.` });
      setPrayers(originalPrayers);
    }
  };
  
  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-2xl font-headline text-primary">
            Salah Tracker
          </CardTitle>
          <CardDescription>Loading your salah checklist for {new Date(dateStringForChecklist).toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}...</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {PRAYER_NAMES.map((name) => (
            <div key={name} className="flex items-center space-x-3 p-3 rounded-md border border-transparent">
              <Skeleton className="h-6 w-6 rounded-full" />
              <Skeleton className="h-5 w-20" />
              <Skeleton className="h-5 w-5 ml-auto" />
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
          <button onClick={fetchPrayers} className="mt-4 text-primary hover:underline">Try again</button>
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
           <CardDescription>No salah data found for {new Date(dateStringForChecklist).toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}.</CardDescription>
        </CardHeader>
         <CardContent><p>Could not initialize salah data for this day. Salah might be recorded once you interact with them.</p></CardContent>
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
            ? `Check off your salah for today, ${new Date(dateStringForChecklist).toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}.`
            : `Check off your salah for ${new Date(dateStringForChecklist).toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}.`
          }
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-2">
        {PRAYER_NAMES.map((prayerName) => {
          const Icon = prayerIcons[prayerName];
          const isCompleted = prayers[prayerName]?.completed || false;
          return (
            <div
              key={prayerName}
              className={`flex items-center justify-between p-3 rounded-lg transition-all duration-300 ease-in-out border ${isCompleted ? 'bg-primary/10 border-primary/50' : 'bg-card hover:bg-secondary/50'}`}
            >
              <div className="flex items-center space-x-3">
                <Icon className={`w-6 h-6 ${isCompleted ? 'text-primary' : 'text-primary/70'}`} />
                <Label htmlFor={`${prayerName}-${dateStringForChecklist}`} className={`text-lg ${isCompleted ? 'line-through text-muted-foreground' : 'text-foreground'}`}>
                  {prayerName}
                </Label>
              </div>
              <Checkbox
                id={`${prayerName}-${dateStringForChecklist}`}
                checked={isCompleted}
                onCheckedChange={(checked) => handlePrayerToggle(prayerName, Boolean(checked))}
                aria-label={`Mark ${prayerName} as ${isCompleted ? 'pending' : 'completed'}`}
                className="h-6 w-6 rounded-md data-[state=checked]:bg-primary data-[state=checked]:text-primary-foreground data-[state=checked]:border-primary border-primary/50"
              />
            </div>
          );
        })}
      </CardContent>
    </Card>
  );
}
