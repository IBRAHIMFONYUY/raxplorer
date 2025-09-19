'use server';

import { generateTestCases } from '@/ai/flows/ai-driven-testing';
import { z } from 'zod';

const formSchema = z.object({
  apiDefinition: z.string().min(10, 'API definition must be at least 10 characters long.'),
  dataModel: z.string().optional(),
});

export async function generateTestCasesAction(prevState: any, formData: FormData) {
  const validatedFields = formSchema.safeParse({
    apiDefinition: formData.get('apiDefinition'),
    dataModel: formData.get('dataModel'),
  });

  if (!validatedFields.success) {
    return {
      message: 'Validation failed.',
      errors: validatedFields.error.flatten().fieldErrors,
      data: null,
    };
  }

  try {
    const result = await generateTestCases({
      apiDefinition: validatedFields.data.apiDefinition,
      dataModel: validatedFields.data.dataModel,
    });
    return {
      message: 'Success',
      errors: null,
      data: result.testCases,
    };
  } catch (error) {
    console.error(error);
    return {
      message: 'Failed to generate test cases. Please try again.',
      errors: null,
      data: null,
    };
  }
}
