'use client';

import { useActionState, useEffect } from 'react';
import { useForm, FormProvider, useFormContext } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { generateMockServerAction } from './actions';
import { useToast } from '@/hooks/use-toast';
import { Loader2 } from 'lucide-react';

const formSchema = z.object({
  prompt: z
    .string()
    .min(10, 'Please provide a more detailed description (min 10 characters).')
    .max(2000, 'Description is too long (max 2000 characters).'),
});

const initialState = {
  message: '',
  errors: null,
  data: null,
};

function SubmitButton() {
  const { formState } = useFormContext();
  return (
    <Button type="submit" disabled={formState.isSubmitting}>
      {formState.isSubmitting ? (
        <>
          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          Generating...
        </>
      ) : (
        'Generate Mock Server'
      )}
    </Button>
  );
}

export default function MockServerPage() {
  const [state, formAction] = useActionState(
    generateMockServerAction,
    initialState
  );
  const { toast } = useToast();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      prompt: `openapi: 3.0.0
info:
  title: Simple User API
  version: 1.0.0
paths:
  /users:
    get:
      summary: Get all users
      responses:
        '200':
          description: A list of users
          content:
            application/json:
              schema:
                type: array
                items:
                  $ref: '#/components/schemas/User'
components:
  schemas:
    User:
      type: object
      properties:
        id:
          type: integer
        name:
          type: string`,
    },
  });

  useEffect(() => {
    if (state.message && state.message !== 'Success') {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: state.message,
      });
    }
  }, [state, toast]);

  return (
    <div className="grid gap-6 md:grid-cols-2">
      <Card>
        <CardHeader>
          <CardTitle>Mock Server Generator</CardTitle>
          <CardDescription>
            Generate a mock API from an OpenAPI spec or a natural language
            description.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <FormProvider {...form}>
            <form action={formAction} className="space-y-6">
              <FormField
                control={form.control}
                name="prompt"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>API Specification or Description</FormLabel>
                    <FormControl>
                      <Textarea
                        className="min-h-[300px] font-code text-sm"
                        placeholder="e.g., An API for managing a list of tasks with GET, POST, and DELETE endpoints."
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <SubmitButton />
            </form>
          </FormProvider>
        </CardContent>
      </Card>
      <Card>
        <CardHeader>
          <CardTitle>Generated Mock API Definition</CardTitle>
          <CardDescription>
            The generated definition will appear here.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <pre className="h-full min-h-[400px] w-full overflow-auto rounded-lg bg-secondary p-4">
            <code className="font-code text-sm text-secondary-foreground">
              {state.data ? state.data : 'Awaiting generation...'}
            </code>
          </pre>
        </CardContent>
      </Card>
    </div>
  );
}
