
import AuthenticatedLayout from '@/components/layout/AuthenticatedLayout';
// SalahTipsList import removed
import { BookOpenCheck, Construction } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

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
        
        <Card className="shadow-lg bg-card/80 backdrop-blur-sm">
          <CardHeader className="flex flex-row items-center gap-3 space-y-0">
            <Construction size={28} className="text-primary" />
            <CardTitle className="text-2xl font-headline text-primary">Coming Soon!</CardTitle>
          </CardHeader>
          <CardContent>
            <CardDescription className="text-base">
              We're launching soon a collection of insightful tips and best practices to help you improve your Salah.
            </CardDescription>
          </CardContent>
        </Card>
        {/* <SalahTipsList /> Replaced by the Coming Soon card */}
      </div>
    </AuthenticatedLayout>
  );
}
