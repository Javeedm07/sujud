
"use client";

import AuthenticatedLayout from '@/components/layout/AuthenticatedLayout';
import NamazChecklist from '@/components/mawaqit/NamazChecklist';
import DailyInspiration from '@/components/mawaqit/DailyInspiration';
import { useAuth } from '@/hooks/useAuth';
// import { Button } from '@/components/ui/button'; // Removed
// import Link from 'next/link'; // Removed
// import { CalendarDays } from 'lucide-react'; // Removed

export default function HomePage() {
  const { user } = useAuth();

  const userName = user?.displayName && user.displayName.toLowerCase() !== 'user' && user.displayName.trim() !== '' 
    ? user.displayName 
    : 'User';

  return (
    <AuthenticatedLayout>
      <div className="mb-6 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <h1 className="text-3xl font-bold font-headline text-primary">
          Assalam alaikum, {userName}
        </h1>
        {/* Button linking to prayer-history removed */}
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <NamazChecklist />
        </div>
        <div className="space-y-6">
          <DailyInspiration />
        </div>
      </div>
    </AuthenticatedLayout>
  );
}
