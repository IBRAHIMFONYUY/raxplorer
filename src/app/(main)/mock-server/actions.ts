'use server';

import { generateMockApi } from '@/ai/flows/mock-server-generation';
import { z } from 'zod';

const formSchema = z.object({
  prompt: z.string().min(10, 'Prompt must be at least 10 characters long.'),
  creativity: z.number().min(0).max(1),
});

export async function generateMockServerAction(prevState: any, formData: FormData) {
  const validatedFields = formSchema.safeParse({
    prompt: formData.get('prompt'),
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
    const result = await generateMockApi({
      apiSpecification: validatedFields.data.prompt,
      creativity: validatedFields.data.creativity,
    });
    return {
      message: 'Success',
      errors: null,
      data: result.mockApiDefinition,
    };
  } catch (error) {
    console.error(error);
    return {
      message: 'Failed to generate mock API. Please try again.',
      errors: null,
      data: null,
    };
  }
}
