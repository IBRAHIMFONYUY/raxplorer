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
    .enum(['JavaScript', 'TypeScript', 'Node.js', 'Python', 'Go', 'Java', 'C#', 'Ruby'])
    .describe('The programming language for which to generate the code snippet.'),
  creativity: z.number().optional().describe('The creativity level for the AI. A value between 0 and 1.')
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
  prompt: `You are an expert code generation assistant. Your task is to generate a concise code snippet for making an API request in a specified language. The snippet should be self-contained and ready to run.

Generate a code snippet for the following API request:

Endpoint Definition:
{{{endpointDefinition}}}

Programming Language:
{{{language}}}

Please provide only the code snippet as a single block of text.`,
});

const generateCodeSnippetFlow = ai.defineFlow(
  {
    name: 'generateCodeSnippetFlow',
    inputSchema: CodeSnippetInputSchema,
    outputSchema: CodeSnippetOutputSchema,
  },
  async input => {
    const {output} = await prompt(input, { config: { temperature: input.creativity } });
    return output!;
  }
);
