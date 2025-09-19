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
} from '@/components/ui/form';
import { generateDocsAction } from './actions';
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


export default function AutoDocsPage() {
  const [state, formAction, isPending] = useActionState(generateDocsAction, initialState);
  const { toast } = useToast();
  const [creativity, setCreativity] = useState(0.5);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      prompt: `Endpoint: GET /api/v1/users/{id}
Description: Retrieves a specific user by their unique ID.
Path Parameters:
  - id (integer): The unique identifier for the user.
Responses:
  - 200 OK: Returns the user object.
  - 404 Not Found: If the user with the specified ID does not exist.`,
    },
  });

  const { control, formState: { errors } } = form;
  
  useEffect(() => {
    const storedCreativity = localStorage.getItem('aiCreativity');
    if (storedCreativity) {
      setCreativity(parseFloat(storedCreativity));
    }
  }, []);

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
          <CardTitle>Auto-Documentation</CardTitle>
          <CardDescription>
            AI automatically generates API documentation from endpoint
            definitions.
          </CardDescription>
        </CardHeader>
        <CardContent>
            <form
              action={formAction}
              className="space-y-6"
            >
              <FormItem>
                <FormLabel>Endpoint Definition</FormLabel>
                <FormControl>
                  <Textarea
                    name="prompt"
                    className="min-h-[300px] font-code text-sm"
                    placeholder="Paste your endpoint definition here..."
                    defaultValue={form.getValues('prompt')}
                  />
                </FormControl>
                {errors.prompt && <FormMessage>{errors.prompt.message}</FormMessage>}
              </FormItem>
              <input type="hidden" name="creativity" value={creativity} />
              <Button type="submit" disabled={isPending}>
                {isPending ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Generating...
                  </>
                ) : (
                  'Generate Documentation'
                )}
              </Button>
            </form>
        </CardContent>
      </Card>
      <Card>
        <CardHeader>
          <CardTitle>Generated Documentation</CardTitle>
          <CardDescription>
            The generated documentation will appear here.
          </CardDescription>
        </CardHeader>
        <CardContent>
           <div className="prose prose-sm dark:prose-invert max-w-none rounded-lg border bg-card-foreground/5 p-4 h-full min-h-[400px]">
             {isPending && !state.data ? (
                <div className="flex items-center justify-center h-full">
                    <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                    <p>Generating documentation...</p>
                </div>
             ) : state.data ? (
              <div dangerouslySetInnerHTML={{ __html: (state.data as string).replace(/\n/g, '<br />').replace(/### (.*)/g, '<h3 class="text-lg font-semibold">$1</h3>').replace(/## (.*)/g, '<h2 class="text-xl font-bold">$1</h2>').replace(/# (.*)/g, '<h1 class="text-2xl font-bold">$1</h1>') }} />
            ) : (
              <p className="text-muted-foreground">Awaiting generation...</p>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
