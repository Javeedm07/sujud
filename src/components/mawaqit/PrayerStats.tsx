"use client";

import React, { useEffect, useState } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell, LineChart, Line } from 'recharts';
import { useAuth } from '@/hooks/useAuth';
import { getPrayerStats, PRAYER_NAMES } from '@/lib/firestore';
import type { PrayerStat, PrayerName } from '@/lib/types';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Skeleton } from '@/components/ui/skeleton';

const COLORS_PIE = ['hsl(var(--accent))', 'hsl(var(--muted))']; // Completed, Missed
const BAR_COLOR = 'hsl(var(--primary))';
const LINE_COLOR = 'hsl(var(--accent))';

export default function PrayerStats() {
  const { user } = useAuth();
  const [barData, setBarData] = useState<PrayerStat[]>([]);
  const [pieData, setPieData] = useState<{ name: string; value: number }[]>([]);
  const [lineData, setLineData] = useState<PrayerStat[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  const [pieFilter, setPieFilter] = useState<PrayerName | 'all'>('all');

  useEffect(() => {
    if (!user) return;

    const fetchAllStats = async () => {
      setLoading(true);
      setError(null);
      try {
        const barStats = await getPrayerStats(user.uid, 'daily', 'all');
        // @ts-ignore
        setBarData(barStats);

        const initialPieStats = await getPrayerStats(user.uid, 'monthly', pieFilter);
         // @ts-ignore
        setPieData(initialPieStats as { name: string; value: number }[]);
        
        const lineStats = await getPrayerStats(user.uid, 'weekly', 'all');
         // @ts-ignore
        setLineData(lineStats);

      } catch (err) {
        console.error("Failed to fetch prayer stats:", err);
        setError("Could not load prayer statistics. Please try again later.");
      } finally {
        setLoading(false);
      }
    };

    fetchAllStats();
  }, [user, pieFilter]);

  const handlePieFilterChange = async (value: string) => {
    if (!user) return;
    setPieFilter(value as PrayerName | 'all');
    setLoading(true);
    try {
        const newPieStats = await getPrayerStats(user.uid, 'monthly', value as PrayerName | 'all');
        // @ts-ignore
        setPieData(newPieStats as { name: string; value: number }[]);
    } catch (err) {
        console.error("Failed to fetch pie chart stats:", err);
        setError("Could not load pie chart statistics.");
    } finally {
        setLoading(false);
    }
  }

  if (loading) {
    return (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card><CardHeader><Skeleton className="h-6 w-3/4 mb-2" /><Skeleton className="h-4 w-1/2" /></CardHeader><CardContent><Skeleton className="h-64 w-full" /></CardContent></Card>
            <Card><CardHeader><Skeleton className="h-6 w-3/4 mb-2" /><Skeleton className="h-4 w-1/2" /></CardHeader><CardContent><Skeleton className="h-64 w-full" /></CardContent></Card>
            <Card className="md:col-span-2"><CardHeader><Skeleton className="h-6 w-3/4 mb-2" /><Skeleton className="h-4 w-1/2" /></CardHeader><CardContent><Skeleton className="h-64 w-full" /></CardContent></Card>
        </div>
    );
  }

  if (error) {
    return <Card><CardHeader><CardTitle>Error</CardTitle></CardHeader><CardContent><p className="text-destructive">{error}</p></CardContent></Card>;
  }

  return (
    <div className="space-y-6">
        <Card className="shadow-lg">
            <CardHeader>
            <CardTitle className="font-headline text-primary">Prayers Completed (Last 7 Days)</CardTitle>
            <CardDescription>Total prayers marked as completed each day.</CardDescription>
            </CardHeader>
            <CardContent>
            {barData.length > 0 ? (
                <ResponsiveContainer width="100%" height={300}>
                <BarChart data={barData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                    <XAxis dataKey="date" tickFormatter={(tick) => new Date(tick).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} stroke="hsl(var(--muted-foreground))" />
                    <YAxis allowDecimals={false} stroke="hsl(var(--muted-foreground))" />
                    <Tooltip contentStyle={{ backgroundColor: 'hsl(var(--background))', border: '1px solid hsl(var(--border))', borderRadius: 'var(--radius)' }} labelStyle={{ color: 'hsl(var(--foreground))' }} itemStyle={{ color: BAR_COLOR }} />
                    <Bar dataKey="count" fill={BAR_COLOR} name="Completed Prayers" radius={[4, 4, 0, 0]} />
                </BarChart>
                </ResponsiveContainer>
            ) : <p>No data available for the bar chart.</p>}
            </CardContent>
        </Card>

        <Card className="shadow-lg">
            <CardHeader>
            <div className="flex justify-between items-center">
                <div>
                    <CardTitle className="font-headline text-primary">Monthly Prayer Completion</CardTitle>
                    <CardDescription>Overall percentage for the last 30 days.</CardDescription>
                </div>
                <Select value={pieFilter} onValueChange={handlePieFilterChange}>
                    <SelectTrigger className="w-[180px]">
                        <SelectValue placeholder="Filter by prayer" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="all">All Prayers</SelectItem>
                        {PRAYER_NAMES.map(name => <SelectItem key={name} value={name}>{name}</SelectItem>)}
                    </SelectContent>
                </Select>
            </div>
            </CardHeader>
            <CardContent>
            {(pieData.length > 0 && pieData.some(d => d.value > 0)) ? (
                <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                    <Pie data={pieData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={100} label>
                    {pieData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS_PIE[index % COLORS_PIE.length]} />
                    ))}
                    </Pie>
                    <Tooltip contentStyle={{ backgroundColor: 'hsl(var(--background))', border: '1px solid hsl(var(--border))', borderRadius: 'var(--radius)' }} />
                    <Legend />
                </PieChart>
                </ResponsiveContainer>
            ) : <p>No data available for the pie chart or all values are zero.</p>}
            </CardContent>
        </Card>
        
        <Card className="shadow-lg">
            <CardHeader>
            <CardTitle className="font-headline text-primary">Prayer Consistency Trend (Last 4 Weeks)</CardTitle>
            <CardDescription>Total prayers completed week over week.</CardDescription>
            </CardHeader>
            <CardContent>
            {lineData.length > 0 ? (
                <ResponsiveContainer width="100%" height={300}>
                <LineChart data={lineData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                    <XAxis dataKey="week" stroke="hsl(var(--muted-foreground))" />
                    <YAxis allowDecimals={false} stroke="hsl(var(--muted-foreground))" />
                    <Tooltip contentStyle={{ backgroundColor: 'hsl(var(--background))', border: '1px solid hsl(var(--border))', borderRadius: 'var(--radius)' }} labelStyle={{ color: 'hsl(var(--foreground))' }} itemStyle={{ color: LINE_COLOR }} />
                    <Line type="monotone" dataKey="count" stroke={LINE_COLOR} strokeWidth={2} name="Completed Prayers" dot={{ r: 4, fill: LINE_COLOR }} activeDot={{ r: 6 }}/>
                </LineChart>
                </ResponsiveContainer>
            ): <p>No data available for the line chart.</p>}
            </CardContent>
        </Card>
    </div>
  );
}
