'use client';

import { useActionState, useEffect, useState } from 'react';
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
  const isSubmitting = formState.isSubmitting;

  return (
    <Button type="submit" disabled={isSubmitting}>
      {isSubmitting ? (
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
  const [creativity, setCreativity] = useState(0.5);

  useEffect(() => {
    const storedCreativity = localStorage.getItem('aiCreativity');
    if (storedCreativity) {
      setCreativity(parseFloat(storedCreativity));
    }
  }, []);

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

  const { handleSubmit, formState } = form;

  const handleFormAction = (data: z.infer<typeof formSchema>) => {
    const formData = new FormData();
    formData.append('prompt', data.prompt);
    formData.append('creativity', creativity.toString());
    formAction(formData);
  };

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
            <form onSubmit={handleSubmit(handleFormAction)} className="space-y-6">
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
          <pre className="h-full min-h-[400px] w-full overflow-auto rounded-lg bg-secondary p-4 whitespace-pre-wrap">
            <code className="font-code text-sm text-secondary-foreground">
              {formState.isSubmitting && !state.data ? (
                <div className="flex items-center justify-center h-full">
                    <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                    <p>Generating mock server...</p>
                </div>
              ) : state.data ? state.data : 'Awaiting generation...'}
            </code>
          </pre>
        </CardContent>
      </Card>
    </div>
  );
}
