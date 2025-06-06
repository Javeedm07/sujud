import AuthenticatedLayout from '@/components/layout/AuthenticatedLayout';
import PrayerStats from '@/components/mawaqit/PrayerStats';

export default function DashboardPage() {
  return (
    <AuthenticatedLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold font-headline text-primary">Your Prayer Dashboard</h1>
          <p className="text-muted-foreground">
            Visualize your prayer consistency and track your progress over time.
          </p>
        </div>
        <PrayerStats />
      </div>
    </AuthenticatedLayout>
  );
}
