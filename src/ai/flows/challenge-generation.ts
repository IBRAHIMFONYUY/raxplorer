'use server';

/**
 * @fileOverview An AI flow for generating gamified API challenges.
 *
 * - generateChallenge - A function that generates a new challenge.
 * - GenerateChallengeOutput - The return type for the generateChallenge function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const KeyValueSchema = z.object({
  key: z.string(),
  value: z.string(),
});

const RequestSchema = z.object({
  method: z.enum(['GET', 'POST', 'PUT', 'PATCH', 'DELETE']),
  url: z.string().describe('The full URL for the request.'),
  body: z.string().optional().describe('The request body as a stringified JSON object if applicable.'),
  headers: z.array(KeyValueSchema).optional().describe('An array of request headers.'),
  queryParams: z.array(KeyValueSchema).optional().describe('An array of query parameters.'),
});

const GenerateChallengeOutputSchema = z.object({
    id: z.string().describe("A unique slug-style ID for the challenge, e.g., 'fetch-user-posts'."),
    title: z.string().describe('A catchy title for the challenge.'),
    description: z.string().describe('A brief, engaging description of the task.'),
    xp: z.number().describe('The experience points (XP) awarded for completing the challenge, between 50 and 150.'),
    request: RequestSchema.describe('The API request the user needs to perform to complete the challenge.')
});
export type GenerateChallengeOutput = z.infer<typeof GenerateChallengeOutputSchema>;


export async function generateChallenge(): Promise<GenerateChallengeOutput> {
  return generateChallengeFlow();
}

const prompt = ai.definePrompt({
  name: 'generateChallengePrompt',
  output: {schema: GenerateChallengeOutputSchema},
  prompt: `You are an AI Mentor for an API learning platform. Your task is to generate a new, unique API challenge for a student. The challenge should be based on a common public API like JSONPlaceholder.

The challenge must be a single API request and should be solvable within an API playground.

Generate a creative challenge that is interesting and educational. Provide a unique ID, a title, a description, an XP value, and the full request details.`,
});

const generateChallengeFlow = ai.defineFlow(
  {
    name: 'generateChallengeFlow',
    outputSchema: GenerateChallengeOutputSchema,
  },
  async () => {
    const {output} = await prompt();
    return output!;
  }
);
