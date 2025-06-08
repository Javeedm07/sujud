
import AuthenticatedLayout from '@/components/layout/AuthenticatedLayout';
import NamazChecklist from '@/components/mawaqit/NamazChecklist';
import DailyInspiration from '@/components/mawaqit/DailyInspiration';

export default function HomePage() {
  return (
    <AuthenticatedLayout>
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
