'use server';

/**
 * @fileOverview Code snippet generation AI agent.
 *
 * - generateCodeSnippet - A function that generates code snippets for API requests.
 * - CodeSnippetInput - The input type for the generateCodeSnippet function.
 * - CodeSnippetOutput - The return type for the generateCodeSnippet function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const CodeSnippetInputSchema = z.object({
  endpointDefinition: z
    .string()
    .describe('The OpenAPI definition or a natural language description of the API endpoint.'),
  language: z
    .enum(['Node.js', 'Python', 'Go'])
    .describe('The programming language for which to generate the code snippet.'),
});
export type CodeSnippetInput = z.infer<typeof CodeSnippetInputSchema>;

const CodeSnippetOutputSchema = z.object({
  codeSnippet: z
    .string()
    .describe('The generated code snippet for the API request in the specified language.'),
});
export type CodeSnippetOutput = z.infer<typeof CodeSnippetOutputSchema>;

export async function generateCodeSnippet(input: CodeSnippetInput): Promise<CodeSnippetOutput> {
  return generateCodeSnippetFlow(input);
}

const prompt = ai.definePrompt({
  name: 'codeSnippetPrompt',
  input: {schema: CodeSnippetInputSchema},
  output: {schema: CodeSnippetOutputSchema},
  prompt: `You are a code generation expert. You will generate a code snippet for an API request in a specific language, based on an endpoint definition.

Endpoint Definition: {{{endpointDefinition}}}
Language: {{{language}}}

Please provide the code snippet.`,
});

const generateCodeSnippetFlow = ai.defineFlow(
  {
    name: 'generateCodeSnippetFlow',
    inputSchema: CodeSnippetInputSchema,
    outputSchema: CodeSnippetOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
