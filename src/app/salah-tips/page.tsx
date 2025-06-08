
import AuthenticatedLayout from '@/components/layout/AuthenticatedLayout';
import SalahTipsList from '@/components/mawaqit/SalahTipsList';
import { BookOpenCheck } from 'lucide-react';

export default function SalahTipsPage() {
  return (
    <AuthenticatedLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold font-headline text-primary flex items-center gap-2">
            <BookOpenCheck size={30} /> Salah Improvement Tips
          </h1>
          <p className="text-muted-foreground">
            Discover insights and practices to enhance the quantity and quality of your prayers.
          </p>
        </div>
        <SalahTipsList />
      </div>
    </AuthenticatedLayout>
  );
}
