
"use client";

import React, { useEffect, useState, useCallback } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell, LineChart, Line } from 'recharts';
import { useAuth } from '@/hooks/useAuth';
import { getPrayerStats, PRAYER_NAMES } from '@/lib/firestore';
import type { PrayerStat, PrayerName } from '@/lib/types';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { cn } from '@/lib/utils';

const COLORS_PIE = ['hsl(var(--accent))', 'hsl(var(--destructive))', 'hsl(var(--muted))']; // Prayed, Not Prayed, Not Marked
const BAR_COLOR = 'hsl(var(--primary))';
const LINE_COLOR = 'hsl(var(--accent))';

const filterOptions: { label: string; value: PrayerName | 'all' }[] = [
  { label: 'All', value: 'all' },
  ...PRAYER_NAMES.map(name => ({ label: name, value: name })),
];

export default function PrayerStats() {
  const { user } = useAuth();
  const [barData, setBarData] = useState<PrayerStat[]>([]);
  const [pieData, setPieData] = useState<{ name: string; value: number }[]>([]);
  const [lineData, setLineData] = useState<PrayerStat[]>([]);
  
  const [loadingBar, setLoadingBar] = useState(true);
  const [loadingPie, setLoadingPie] = useState(true);
  const [loadingLine, setLoadingLine] = useState(true);
  
  const [error, setError] = useState<string | null>(null);
  const [pieFilter, setPieFilter] = useState<PrayerName | 'all'>('all');

  useEffect(() => {
    if (!user) {
      setLoadingBar(false);
      setLoadingLine(false);
      return;
    }

    const fetchBarAndLineData = async () => {
      setLoadingBar(true);
      setLoadingLine(true);
      setError(null);
      try {
        const [barStats, lineStats] = await Promise.all([
          getPrayerStats(user.uid, 'daily', 'all'),
          getPrayerStats(user.uid, 'weekly', 'all')
        ]);
        setBarData(barStats as PrayerStat[]);
        setLineData(lineStats as PrayerStat[]);
      } catch (err) {
        console.error("Failed to fetch bar/line prayer stats:", err);
        setError("Could not load some prayer statistics. Please try again later.");
      } finally {
        setLoadingBar(false);
        setLoadingLine(false);
      }
    };

    fetchBarAndLineData();
  }, [user]);

  useEffect(() => {
    if (!user) {
      setLoadingPie(false);
      return;
    }

    const fetchPieData = async () => {
      setLoadingPie(true);
      setError(null); 
      try {
        const initialPieStats = await getPrayerStats(user.uid, 'monthly', pieFilter);
        setPieData(initialPieStats as { name: string; value: number }[]);
      } catch (err) {
        console.error("Failed to fetch pie chart stats:", err);
        setError("Could not load monthly prayer statistics. Please try again later.");
      } finally {
        setLoadingPie(false);
      }
    };

    fetchPieData();
  }, [user, pieFilter]);


  if (error) {
    return <Card><CardHeader><CardTitle>Error</CardTitle></CardHeader><CardContent><p className="text-destructive">{error}</p></CardContent></Card>;
  }

  return (
    <div className="space-y-6">
        <Card>
            <CardHeader>
            <CardTitle className="font-headline text-primary">Prayers Completed (Last 7 Days)</CardTitle>
            <CardDescription>Total prayers marked as completed each day.</CardDescription>
            </CardHeader>
            <CardContent>
            {loadingBar ? (
                <Skeleton className="h-[300px] w-full" />
            ) : barData.length > 0 ? (
                <ResponsiveContainer width="100%" height={300}>
                <BarChart data={barData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                    <XAxis dataKey="date" tickFormatter={(tick) => new Date(tick).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} stroke="hsl(var(--muted-foreground))" />
                    <YAxis allowDecimals={false} stroke="hsl(var(--muted-foreground))" domain={[0, 5]} ticks={[0,1,2,3,4,5]} />
                    <Tooltip contentStyle={{ backgroundColor: 'hsl(var(--background))', border: '1px solid hsl(var(--border))', borderRadius: 'var(--radius)' }} labelStyle={{ color: 'hsl(var(--foreground))' }} itemStyle={{ color: BAR_COLOR }} />
                    <Bar dataKey="count" fill={BAR_COLOR} name="Completed Prayers" radius={[4, 4, 0, 0]} />
                </BarChart>
                </ResponsiveContainer>
            ) : <p className="text-muted-foreground">No data available for daily prayer completion.</p>}
            </CardContent>
        </Card>

        <Card>
            <CardHeader>
            <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4">
                <div>
                    <CardTitle className="font-headline text-primary">Monthly Prayer Status</CardTitle>
                    <CardDescription>Distribution for the last 30 days.</CardDescription>
                </div>
                <div className="flex flex-wrap gap-2">
                  {filterOptions.map(option => (
                    <Button
                      key={option.value}
                      variant={pieFilter === option.value ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => setPieFilter(option.value)}
                      className={cn(
                        "transition-all duration-200 ease-in-out",
                        pieFilter === option.value ? "shadow-md scale-105" : "hover:shadow-sm"
                      )}
                    >
                      {option.label}
                    </Button>
                  ))}
                </div>
            </div>
            </CardHeader>
            <CardContent>
            {loadingPie ? (
                 <Skeleton className="h-[300px] w-full" />
            ) : (pieData.length > 0 && pieData.some(d => d.value > 0)) ? (
                <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                    <Pie data={pieData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={100} label>
                    {pieData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS_PIE[index % COLORS_PIE.length]} stroke="hsl(var(--background))" />
                    ))}
                    </Pie>
                    <Tooltip contentStyle={{ backgroundColor: 'hsl(var(--background))', border: '1px solid hsl(var(--border))', borderRadius: 'var(--radius)' }} />
                    <Legend />
                </PieChart>
                </ResponsiveContainer>
            ) : <p className="text-muted-foreground">No data available for monthly prayer status or all values are zero.</p>}
            </CardContent>
        </Card>
        
        <Card>
            <CardHeader>
            <CardTitle className="font-headline text-primary">Prayer Consistency Trend (Last 4 Weeks)</CardTitle>
            <CardDescription>Total prayers completed week over week.</CardDescription>
            </CardHeader>
            <CardContent>
            {loadingLine ? (
                <Skeleton className="h-[300px] w-full" />
            ) : lineData.length > 0 ? (
                <ResponsiveContainer width="100%" height={300}>
                <LineChart data={lineData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                    <XAxis dataKey="week" stroke="hsl(var(--muted-foreground))" />
                    <YAxis allowDecimals={false} stroke="hsl(var(--muted-foreground))" />
                    <Tooltip contentStyle={{ backgroundColor: 'hsl(var(--background))', border: '1px solid hsl(var(--border))', borderRadius: 'var(--radius)' }} labelStyle={{ color: 'hsl(var(--foreground))' }} itemStyle={{ color: LINE_COLOR }} />
                    <Line type="monotone" dataKey="count" stroke={LINE_COLOR} strokeWidth={2} name="Completed Prayers" dot={{ r: 4, fill: LINE_COLOR }} activeDot={{ r: 6 }}/>
                </LineChart>
                </ResponsiveContainer>
            ): <p className="text-muted-foreground">No data available for weekly prayer consistency.</p>}
            </CardContent>
        </Card>
    </div>
  );
}
