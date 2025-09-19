'use server';

/**
 * @fileOverview AI flow for generating mock APIs from OpenAPI specifications or natural language descriptions.
 *
 * - generateMockApi - A function that generates mock APIs.
 * - GenerateMockApiInput - The input type for the generateMockApi function.
 * - GenerateMockApiOutput - The return type for the generateMockApi function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const GenerateMockApiInputSchema = z.object({
  apiSpecification: z
    .string()
    .describe(
      'The OpenAPI specification or natural language description of the API.'
    ),
  creativity: z.number().optional().describe('The creativity level for the AI. A value between 0 and 1.')
});
export type GenerateMockApiInput = z.infer<typeof GenerateMockApiInputSchema>;

const GenerateMockApiOutputSchema = z.object({
  mockApiDefinition: z.string().describe('The generated mock API definition.'),
});
export type GenerateMockApiOutput = z.infer<typeof GenerateMockApiOutputSchema>;

export async function generateMockApi(
  input: GenerateMockApiInput
): Promise<GenerateMockApiOutput> {
  return generateMockApiFlow(input);
}

const prompt = ai.definePrompt({
  name: 'generateMockApiPrompt',
  input: {schema: GenerateMockApiInputSchema},
  output: {schema: GenerateMockApiOutputSchema},
  prompt: `You are an expert API developer who can generate mock APIs from OpenAPI specifications or natural language descriptions.

  Please generate a mock API definition based on the following specification:

  {{{apiSpecification}}}

  The mock API definition should be a valid OpenAPI specification or a set of instructions on how to create a mock server. Return the mock API definition.`,
});

const generateMockApiFlow = ai.defineFlow(
  {
    name: 'generateMockApiFlow',
    inputSchema: GenerateMockApiInputSchema,
    outputSchema: GenerateMockApiOutputSchema,
  },
  async input => {
    const {output} = await prompt(input, { config: { temperature: input.creativity } });
    return output!;
  }
);
