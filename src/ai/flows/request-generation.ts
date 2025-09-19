'use server';

/**
 * @fileOverview An AI flow for generating API request details from a natural language prompt.
 *
 * - generateRequestFromPrompt - A function that generates an API request from a prompt.
 * - GenerateRequestInput - The input type for the generateRequestFromPrompt function.
 * - GenerateRequestOutput - The return type for the generateRequestFromPrompt function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const GenerateRequestInputSchema = z.object({
  prompt: z.string().describe('The natural language prompt describing the API request.'),
});
export type GenerateRequestInput = z.infer<typeof GenerateRequestInputSchema>;

const KeyValueSchema = z.object({
  key: z.string(),
  value: z.string(),
});

const GenerateRequestOutputSchema = z.object({
  method: z.enum(['GET', 'POST', 'PUT', 'PATCH', 'DELETE']),
  url: z.string().describe('The full URL for the request, without query parameters.'),
  queryParams: z.array(KeyValueSchema).optional().describe('An array of query parameters.'),
  headers: z.array(KeyValueSchema).optional().describe('An array of request headers.'),
  body: z.string().optional().describe('The request body as a string. Should be formatted as JSON if applicable.'),
});
export type GenerateRequestOutput = z.infer<typeof GenerateRequestOutputSchema>;

export async function generateRequestFromPrompt(
  input: GenerateRequestInput
): Promise<GenerateRequestOutput> {
  return generateRequestFlow(input);
}

const prompt = ai.definePrompt({
  name: 'generateRequestPrompt',
  input: {schema: GenerateRequestInputSchema},
  output: {schema: GenerateRequestOutputSchema},
  prompt: `You are an expert API developer. Your task is to take a natural language prompt and convert it into a structured API request. You should infer the HTTP method, URL, query parameters, headers, and body from the user's prompt. Assume common public APIs like JSONPlaceholder if no specific domain is mentioned.

Prompt: {{{prompt}}}

Generate the structured API request. If the body should be JSON, format it as a stringified JSON object.`,
});

const generateRequestFlow = ai.defineFlow(
  {
    name: 'generateRequestFlow',
    inputSchema: GenerateRequestInputSchema,
    outputSchema: GenerateRequestOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
