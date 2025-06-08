
import AuthenticatedLayout from '@/components/layout/AuthenticatedLayout';
import PersonalizedVerseSuggestion from '@/components/mawaqit/PersonalizedVerseSuggestion';
import { Wand2 } from 'lucide-react';

export default function VerseSuggestionPage() {
  return (
    <AuthenticatedLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold font-headline text-primary flex items-center gap-2">
            <Wand2 size={30} /> Personalized Verse Suggestion
          </h1>
          {/* Description removed from here */}
        </div>
        <div className="max-w-2xl mx-auto">
          <PersonalizedVerseSuggestion />
        </div>
      </div>
    </AuthenticatedLayout>
  );
}
