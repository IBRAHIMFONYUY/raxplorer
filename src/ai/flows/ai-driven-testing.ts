'use server';

/**
 * @fileOverview AI flow for generating test cases for API endpoints.
 *
 * - generateTestCases - A function that generates test cases.
 * - GenerateTestCasesInput - The input type for the generateTestCases function.
 * - GenerateTestCasesOutput - The return type for the generateTestCases function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const GenerateTestCasesInputSchema = z.object({
  apiDefinition: z
    .string()
    .describe(
      'The OpenAPI specification or natural language description of the API endpoint.'
    ),
  dataModel: z
    .string()
    .optional()
    .describe('The data model (e.g., JSON schema) for the request/response.'),
});
export type GenerateTestCasesInput = z.infer<typeof GenerateTestCasesInputSchema>;

const TestCaseSchema = z.object({
  description: z.string().describe('A description of the test case.'),
  request: z.object({
    method: z.string().describe('The HTTP method.'),
    path: z.string().describe('The request path.'),
    headers: z.record(z.string()).optional().describe('The request headers.'),
    body: z.any().optional().describe('The request body.'),
  }),
  expectedResponse: z.object({
    statusCode: z.number().describe('The expected HTTP status code.'),
    body: z.any().optional().describe('The expected response body.'),
  }),
});

const GenerateTestCasesOutputSchema = z.object({
  testCases: z
    .array(TestCaseSchema)
    .describe('An array of generated test cases.'),
});
export type GenerateTestCasesOutput = z.infer<
  typeof GenerateTestCasesOutputSchema
>;

export async function generateTestCases(
  input: GenerateTestCasesInput
): Promise<GenerateTestCasesOutput> {
  return generateTestCasesFlow(input);
}

const prompt = ai.definePrompt({
  name: 'generateTestCasesPrompt',
  input: {schema: GenerateTestCasesInputSchema},
  output: {schema: GenerateTestCasesOutputSchema},
  prompt: `You are an expert in API testing. Based on the provided API endpoint definition and data model, generate a comprehensive set of test cases. Include tests for the "happy path" (valid inputs), as well as tests for error handling and edge cases (e.g., invalid data types, missing fields, authentication errors).

Your output must be a JSON object with a single key "testCases", which is an array of test case objects. Each test case object must have the following structure:
- "description": A string describing the test case.
- "request": An object with "method", "path", and optionally "headers" and "body".
- "expectedResponse": An object with "statusCode" and optionally "body".

Example structure for a single test case:
{
  "description": "Successful retrieval of a user.",
  "request": {
    "method": "GET",
    "path": "/users/123"
  },
  "expectedResponse": {
    "statusCode": 200
  }
}

API Definition:
{{{apiDefinition}}}

{{#if dataModel}}
Data Model:
{{{dataModel}}}
{{/if}}

Generate the test cases now.`,
});

const generateTestCasesFlow = ai.defineFlow(
  {
    name: 'generateTestCasesFlow',
    inputSchema: GenerateTestCasesInputSchema,
    outputSchema: GenerateTestCasesOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
