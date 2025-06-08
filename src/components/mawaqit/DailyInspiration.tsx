
"use client";

import React, { useEffect, useState, useCallback } from 'react';
import { fetchDailyInspiration, getTodayDateString } from '@/lib/firestore';
import type { DailyInspirationContent } from '@/lib/types';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { BookOpenText, AlertTriangle } from 'lucide-react';

const LOCAL_STORAGE_INSPIRATION_KEY = 'dailyInspiration';
const LOCAL_STORAGE_FETCH_DATE_KEY = 'inspirationFetchDate';

export default function DailyInspiration() {
  const [inspiration, setInspiration] = useState<DailyInspirationContent | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadInspiration = useCallback(async () => {
    setLoading(true);
    setError(null);
    const todayString = getTodayDateString();

    try {
      const data = await fetchDailyInspiration(); // fetchDailyInspiration should always return a valid object due to fallbacks
      setInspiration(data);
      localStorage.setItem(LOCAL_STORAGE_INSPIRATION_KEY, JSON.stringify(data));
      localStorage.setItem(LOCAL_STORAGE_FETCH_DATE_KEY, todayString);
    } catch (err) {
      console.error("Failed to fetch daily inspiration:", err);
      setError("Could not load inspiration. Please try again later.");
      // Attempt to load from local storage as a fallback if fetching fails but data for today might exist
      const storedInspirationString = localStorage.getItem(LOCAL_STORAGE_INSPIRATION_KEY);
      if (storedInspirationString) {
        try {
            const storedInspiration = JSON.parse(storedInspirationString) as DailyInspirationContent;
            setInspiration(storedInspiration);
        } catch (parseError) {
            console.error("Failed to parse stored inspiration on error:", parseError);
        }
      }
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    const todayString = getTodayDateString();
    const storedFetchDate = localStorage.getItem(LOCAL_STORAGE_FETCH_DATE_KEY);
    const storedInspirationString = localStorage.getItem(LOCAL_STORAGE_INSPIRATION_KEY);

    if (storedFetchDate === todayString && storedInspirationString) {
      try {
        const storedInspiration = JSON.parse(storedInspirationString) as DailyInspirationContent;
        setInspiration(storedInspiration);
        setLoading(false);
      } catch (e) {
        console.error("Failed to parse stored inspiration:", e);
        loadInspiration(); // Fetch fresh if parsing fails
      }
    } else {
      // If date is different or no stored inspiration, fetch new one
      loadInspiration();
    }

    // Set up an interval to check for date change (e.g., past midnight)
    const intervalId = setInterval(() => {
      const currentTodayString = getTodayDateString();
      // Use the state or re-get from localStorage for the most accuracy on last fetch date
      const lastFetchedDateFromStorage = localStorage.getItem(LOCAL_STORAGE_FETCH_DATE_KEY); 
      if (currentTodayString !== lastFetchedDateFromStorage) {
        loadInspiration(); // Date has changed, fetch new inspiration
      }
    }, 30 * 1000); // Changed to 30 seconds (30 * 1000 ms) for testing

    return () => clearInterval(intervalId); // Cleanup interval on unmount
  }, [loadInspiration]);

  if (loading) {
    return (
      <Card className="bg-card/80 backdrop-blur-sm">
        <CardHeader>
          <CardTitle className="text-xl font-headline text-primary flex items-center gap-2">
            <BookOpenText size={24} /> Daily Inspiration
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          <Skeleton className="h-6 w-3/4" />
          <Skeleton className="h-4 w-1/2" />
        </CardContent>
      </Card>
    );
  }

  if (error && !inspiration) { // Show error only if there's no inspiration to display
    return (
      <Card className="bg-destructive/10 text-destructive-foreground">
        <CardHeader>
          <CardTitle className="text-xl font-headline flex items-center gap-2">
            <AlertTriangle size={24} /> Error
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p>{error}</p>
        </CardContent>
      </Card>
    );
  }
  
  if (!inspiration) { // Fallback if inspiration is null for any reason (e.g. initial error before any load)
     return (
      <Card className="bg-card/80 backdrop-blur-sm">
        <CardHeader>
          <CardTitle className="text-xl font-headline text-primary flex items-center gap-2">
            <BookOpenText size={24} /> Daily Inspiration
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">Loading inspiration...</p>
        </CardContent>
      </Card>
    );
  }


  return (
    <Card className="bg-card/80 backdrop-blur-sm transform hover:scale-[1.01] transition-transform duration-300 ease-out">
      <CardHeader>
        <CardTitle className="text-xl font-headline text-primary flex items-center gap-2">
          <BookOpenText size={24} /> Daily Inspiration
        </CardTitle>
      </CardHeader>
      <CardContent>
        {error && <p className="text-sm text-destructive mb-2">Note: Could not fetch fresh inspiration. Displaying last known. Error: {error}</p>}
        <blockquote className="text-lg italic text-foreground">
          &ldquo;{inspiration.content}&rdquo;
        </blockquote>
      </CardContent>
      <CardFooter>
        <p className="text-sm text-muted-foreground w-full text-right">- {inspiration.source}</p>
      </CardFooter>
    </Card>
  );
}

