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
  documentation: z.string().describe('The generated API documentation in Markdown format.'),
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
  prompt: `You are an expert technical writer creating comprehensive API documentation. Based on the provided endpoint definition, generate a detailed and well-structured document.

The documentation should include the following sections if applicable:
- A main title with the HTTP Method and Path.
- A clear description of the endpoint's purpose.
- A section for Path Parameters, Query Parameters, and Headers, detailing the name, type, and description of each.
- A section describing the Request Body, including its schema.
- A section for Responses, detailing possible status codes (e.g., 200, 404, 500) and what they mean.
- An example request (e.g., a cURL command).
- An example response body for a successful request.

Return the entire documentation as a single block of text.

Endpoint Definition:
{{{endpointDefinitions}}}
`,
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
