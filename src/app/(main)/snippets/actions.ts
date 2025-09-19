'use server';

import { generateCodeSnippet } from '@/ai/flows/code-snippet-generation';
import { z } from 'zod';

const formSchema = z.object({
  prompt: z
    .string()
    .min(10, 'Endpoint definition must be at least 10 characters long.'),
  language: z.enum(['JavaScript', 'TypeScript', 'Node.js', 'Python', 'Go', 'Java', 'C#', 'Ruby']),
  creativity: z.number().min(0).max(1),
});

export async function generateSnippetAction(
  prevState: any,
  formData: FormData
) {
  const validatedFields = formSchema.safeParse({
    prompt: formData.get('prompt'),
    language: formData.get('language'),
    creativity: parseFloat(formData.get('creativity') as string),
  });

  if (!validatedFields.success) {
    return {
      message: 'Validation failed.',
      errors: validatedFields.error.flatten().fieldErrors,
      data: null,
    };
  }

  try {
    const result = await generateCodeSnippet({
      endpointDefinition: validatedFields.data.prompt,
      language: validatedFields.data.language,
      creativity: validatedFields.data.creativity,
    });
    return {
      message: 'Success',
      errors: null,
      data: result.codeSnippet,
    };
  } catch (error) {
    console.error(error);
    return {
      message: 'Failed to generate code snippet. Please try again.',
      errors: null,
      data: null,
    };
  }
}
