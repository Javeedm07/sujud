// Implemented personalized verse suggestion flow using Genkit and the Gemini LLM.
'use server';

/**
 * @fileOverview Provides personalized verse suggestions from the Quran based on user's challenges.
 *
 * - personalizedVerseSuggestion - A function that suggests relevant verses from the Quran based on user's challenges.
 * - PersonalizedVerseSuggestionInput - The input type for the personalizedVerseSuggestion function.
 * - PersonalizedVerseSuggestionOutput - The return type for the personalizedVerseSuggestion function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const PersonalizedVerseSuggestionInputSchema = z.object({
  challenge: z.string().describe('The current challenge or problem the user is facing.'),
});
export type PersonalizedVerseSuggestionInput = z.infer<typeof PersonalizedVerseSuggestionInputSchema>;

const PersonalizedVerseSuggestionOutputSchema = z.object({
  suggestedVerse: z.string().describe('A relevant verse from the Quran that offers guidance or comfort for the user.'),
  verseExplanation: z.string().describe('A brief explanation of how the verse relates to the user’s challenge.'),
});
export type PersonalizedVerseSuggestionOutput = z.infer<typeof PersonalizedVerseSuggestionOutputSchema>;

export async function personalizedVerseSuggestion(input: PersonalizedVerseSuggestionInput): Promise<PersonalizedVerseSuggestionOutput> {
  return personalizedVerseSuggestionFlow(input);
}

const prompt = ai.definePrompt({
  name: 'personalizedVerseSuggestionPrompt',
  input: {schema: PersonalizedVerseSuggestionInputSchema},
  output: {schema: PersonalizedVerseSuggestionOutputSchema},
  prompt: `You are an AI assistant specializing in providing guidance from the Quran.

  A user is facing the following challenge: {{{challenge}}}.

  Suggest a relevant verse from the Quran that offers guidance or comfort for this challenge.
  Also, provide a brief explanation of how the verse relates to the user’s challenge.  The verse explanation MUST be in terms that are understandable to an average person with no knowledge of Islam.

  Format your response as follows:

  Suggested Verse: [The suggested verse from the Quran]
  Verse Explanation: [A brief explanation of how the verse relates to the user’s challenge]`,
});

const personalizedVerseSuggestionFlow = ai.defineFlow(
  {
    name: 'personalizedVerseSuggestionFlow',
    inputSchema: PersonalizedVerseSuggestionInputSchema,
    outputSchema: PersonalizedVerseSuggestionOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
