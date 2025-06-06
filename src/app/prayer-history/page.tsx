
"use client";

import React, { useState, useEffect } from 'react';
import AuthenticatedLayout from '@/components/layout/AuthenticatedLayout';
import { Calendar } from '@/components/ui/calendar';
import NamazChecklist from '@/components/mawaqit/NamazChecklist';
import { convertDateToYYYYMMDD } from '@/lib/firestore';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';

export default function PrayerHistoryPage() {
  // Default to today's date
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date());
  const [checklistDateString, setChecklistDateString] = useState<string>(convertDateToYYYYMMDD(new Date()));

  const handleDateSelect = (date: Date | undefined) => {
    setSelectedDate(date);
    if (date) {
      setChecklistDateString(convertDateToYYYYMMDD(date));
    }
  };
  
  // Ensure checklistDateString is updated if selectedDate is programmatically changed or on initial load
  useEffect(() => {
    if (selectedDate) {
      setChecklistDateString(convertDateToYYYYMMDD(selectedDate));
    }
  }, [selectedDate]);

  return (
    <AuthenticatedLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold font-headline text-primary">Prayer History</h1>
          <p className="text-muted-foreground">
            Select a date from the calendar to view or update your prayer log.
          </p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card className="md:col-span-1 shadow-lg bg-card/80 backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="text-xl font-headline text-primary">Select Date</CardTitle>
            </CardHeader>
            <CardContent className="p-2 sm:p-6">
              <div className="flex justify-center"> 
                <div className="overflow-x-auto">
                  <Calendar
                    mode="single"
                    selected={selectedDate}
                    onSelect={handleDateSelect}
                    className="rounded-md border min-w-[300px]" 
                    // Allow selection of past dates, disable future dates
                    toDate={new Date()} 
                  />
                </div>
              </div>
            </CardContent>
          </Card>
          <div className="md:col-span-2">
            {selectedDate ? (
              <NamazChecklist
                key={checklistDateString} // Force re-render if date string changes
                initialDateString={checklistDateString}
              />
            ) : (
              <Card className="shadow-lg bg-card/80 backdrop-blur-sm">
                <CardHeader>
                  <CardTitle className="text-xl font-headline text-primary">Prayer Checklist</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground">Please select a date from the calendar to view prayer status.</p>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>
    </AuthenticatedLayout>
  );
}

