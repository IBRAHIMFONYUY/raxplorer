'use client';

import { useActionState, useEffect, useState } from 'react';
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
  FormItem,
  FormLabel,
  FormMessage,
  FormField,
} from '@/components/ui/form';
import { generateMockServerAction } from './actions';
import { useToast } from '@/hooks/use-toast';
import { Loader2 } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';


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

export default function MockServerPage() {
  const [state, formAction, isPending] = useActionState(
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

  useEffect(() => {
    if (state.message && state.message !== 'Success') {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: state.message,
      });
    }
    if (state.errors) {
       const fieldErrors = state.errors as { prompt?: string[] };
       if (fieldErrors.prompt?.[0]) {
         form.setError('prompt', { message: fieldErrors.prompt[0] });
       }
    }
  }, [state, toast, form]);

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
          <Form {...form}>
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
               <input type="hidden" name="creativity" value={creativity} />
              <Button type="submit" disabled={isPending}>
                {isPending ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Generating...
                  </>
                ) : (
                  'Generate Mock Server'
                )}
              </Button>
            </form>
          </Form>
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
              {isPending && !state.data ? (
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
