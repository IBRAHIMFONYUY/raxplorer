'use server';

/**
 * @fileOverview A flow for automatically generating API documentation from endpoint definitions.
 *
 * - generateApiDocumentation - A function that generates API documentation.
 * - GenerateApiDocumentationInput - The input type for the generateApiDocumentation function.
 * - GenerateApiDocumentationOutput - The return type for the generateApiDocumentation function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const GenerateApiDocumentationInputSchema = z.object({
  endpointDefinitions: z
    .string()
    .describe('The endpoint definitions to generate documentation for.'),
});
export type GenerateApiDocumentationInput = z.infer<typeof GenerateApiDocumentationInputSchema>;

const GenerateApiDocumentationOutputSchema = z.object({
  documentation: z.string().describe('The generated API documentation.'),
});
export type GenerateApiDocumentationOutput = z.infer<typeof GenerateApiDocumentationOutputSchema>;

export async function generateApiDocumentation(
  input: GenerateApiDocumentationInput
): Promise<GenerateApiDocumentationOutput> {
  return generateApiDocumentationFlow(input);
}

const prompt = ai.definePrompt({
  name: 'generateApiDocumentationPrompt',
  input: {schema: GenerateApiDocumentationInputSchema},
  output: {schema: GenerateApiDocumentationOutputSchema},
  prompt: `You are an expert API documentation generator. Generate clear and concise API documentation from the following endpoint definitions:\n\nEndpoint Definitions:\n{{endpointDefinitions}}\n\nDocumentation:`,
});

const generateApiDocumentationFlow = ai.defineFlow(
  {
    name: 'generateApiDocumentationFlow',
    inputSchema: GenerateApiDocumentationInputSchema,
    outputSchema: GenerateApiDocumentationOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
