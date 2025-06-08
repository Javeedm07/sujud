"use client";

import React, { useState } from 'react';
import { personalizedVerseSuggestion, type PersonalizedVerseSuggestionInput, type PersonalizedVerseSuggestionOutput } from '@/ai/flows/personalized-verse-suggestion';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Wand2, AlertTriangle, CheckCircle } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { Skeleton } from '../ui/skeleton';

export default function PersonalizedVerseSuggestion() {
  const [challenge, setChallenge] = useState('');
  const [suggestion, setSuggestion] = useState<PersonalizedVerseSuggestionOutput | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!challenge.trim()) {
      toast({ variant: 'destructive', title: 'Input Required', description: 'Please describe your challenge.' });
      return;
    }

    setLoading(true);
    setError(null);
    setSuggestion(null);

    try {
      const input: PersonalizedVerseSuggestionInput = { challenge };
      const result = await personalizedVerseSuggestion(input);
      setSuggestion(result);
      toast({ title: 'Suggestion Ready', description: 'Here is a verse for your reflection.', icon: <CheckCircle className="h-5 w-5 text-accent" /> });
    } catch (err) {
      console.error("Error getting verse suggestion:", err);
      let message = "Could not get a suggestion at this time. Please try again later.";
      if (err instanceof Error) {
        message = err.message;
      }
      setError(message);
      toast({ variant: 'destructive', title: 'Error', description: message });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="shadow-lg bg-card/80 backdrop-blur-sm">
      <CardHeader>
        <CardTitle className="text-xl font-headline text-primary flex items-center gap-2">
          <Wand2 size={24} /> Personalized Verse Suggestion
        </CardTitle>
        <CardDescription>
          Share a challenge you&apos;re facing, and receive a relevant Quranic verse for guidance and reflection.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="challenge" className="block text-sm font-medium text-foreground mb-1">
              Describe your challenge:
            </Label>
            <Textarea
              id="challenge"
              value={challenge}
              onChange={(e) => setChallenge(e.target.value)}
              placeholder="E.g., I'm feeling overwhelmed with work, I'm struggling with patience..."
              rows={3}
              className="w-full"
              disabled={loading}
            />
          </div>
          <Button type="submit" disabled={loading} className="w-full sm:w-auto">
            {loading ? (
              <>
                <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Getting Suggestion...
              </>
            ) : (
              'Get Verse Suggestion'
            )}
          </Button>
        </form>
      </CardContent>

      {loading && !suggestion && (
        <CardFooter className="mt-4 flex flex-col items-start space-y-2">
          <Skeleton className="h-5 w-1/3" />
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-4/5" />
          <Skeleton className="h-5 w-1/4 mt-2" />
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-2/3" />
        </CardFooter>
      )}

      {error && (
        <CardFooter className="mt-4 text-destructive bg-destructive/10 p-4 rounded-md">
          <div className="flex items-center gap-2">
            <AlertTriangle size={20} />
            <p>{error}</p>
          </div>
        </CardFooter>
      )}

      {suggestion && (
        <CardFooter className="mt-4 flex flex-col items-start border-t pt-4">
          <div className="w-full">
            <h3 className="text-lg font-semibold text-accent mb-1">Suggested Verse:</h3>
            <p className="italic text-foreground mb-3">&ldquo;{suggestion.suggestedVerse}&rdquo;</p>
            <h3 className="text-lg font-semibold text-accent mb-1">Explanation:</h3>
            <p className="text-foreground">{suggestion.verseExplanation}</p>
          </div>
        </CardFooter>
      )}
    </Card>
  );
}
