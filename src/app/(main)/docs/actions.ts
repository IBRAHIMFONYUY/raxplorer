'use server';

import { generateApiDocumentation } from '@/ai/flows/auto-api-documentation';
import { z } from 'zod';

const formSchema = z.object({
  prompt: z
    .string()
    .min(10, 'Endpoint definition must be at least 10 characters long.'),
});

export async function generateDocsAction(prevState: any, formData: FormData) {
  const validatedFields = formSchema.safeParse({
    prompt: formData.get('prompt'),
  });

  if (!validatedFields.success) {
    return {
      message: 'Validation failed.',
      errors: validatedFields.error.flatten().fieldErrors,
      data: null,
    };
  }

  try {
    const result = await generateApiDocumentation({
      endpointDefinitions: validatedFields.data.prompt,
    });
    return {
      message: 'Success',
      errors: null,
      data: result.documentation,
    };
  } catch (error) {
    console.error(error);
    return {
      message: 'Failed to generate documentation. Please try again.',
      errors: null,
      data: null,
    };
  }
}
