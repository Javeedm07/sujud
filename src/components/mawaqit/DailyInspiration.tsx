"use client";

import React, { useEffect, useState } from 'react';
import { fetchDailyInspiration } from '@/lib/firestore';
import type { DailyInspirationContent } from '@/lib/types';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { BookOpenText, AlertTriangle } from 'lucide-react';

export default function DailyInspiration() {
  const [inspiration, setInspiration] = useState<DailyInspirationContent | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const getInspiration = async () => {
      setLoading(true);
      setError(null);
      try {
        const data = await fetchDailyInspiration();
        setInspiration(data);
      } catch (err) {
        console.error("Failed to fetch daily inspiration:", err);
        setError("Could not load inspiration. Please try again later.");
      } finally {
        setLoading(false);
      }
    };
    getInspiration();
  }, []);

  if (loading) {
    return (
      <Card className="shadow-lg bg-card/80 backdrop-blur-sm">
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

  if (error || !inspiration) {
    return (
      <Card className="shadow-lg bg-destructive/10 text-destructive-foreground">
        <CardHeader>
          <CardTitle className="text-xl font-headline flex items-center gap-2">
            <AlertTriangle size={24} /> Error
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p>{error || "No inspiration available at the moment."}</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="shadow-lg bg-card/80 backdrop-blur-sm transform hover:scale-[1.01] transition-transform duration-300 ease-out">
      <CardHeader>
        <CardTitle className="text-xl font-headline text-primary flex items-center gap-2">
          <BookOpenText size={24} /> Daily Inspiration
        </CardTitle>
      </CardHeader>
      <CardContent>
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
