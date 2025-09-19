'use client';

import { useActionState, useEffect, useState } from 'react';
import { useForm, FormProvider } from 'react-hook-form';
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
import { generateDocsAction } from './actions';
import { useToast } from '@/hooks/use-toast';
import { Loader2 } from 'lucide-react';
import { useFormContext } from 'react-hook-form';

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
        'Generate Documentation'
      )}
    </Button>
  );
}

export default function AutoDocsPage() {
  const [state, formAction] = useActionState(generateDocsAction, initialState);
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
      prompt: `Endpoint: GET /api/v1/users/{id}
Description: Retrieves a specific user by their unique ID.
Path Parameters:
  - id (integer): The unique identifier for the user.
Responses:
  - 200 OK: Returns the user object.
  - 404 Not Found: If the user with the specified ID does not exist.`,
    },
  });

  const handleFormAction = (formData: FormData) => {
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
          <CardTitle>Auto-Documentation</CardTitle>
          <CardDescription>
            AI automatically generates API documentation from endpoint
            definitions.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <FormProvider {...form}>
            <form action={handleFormAction} className="space-y-6">
              <FormField
                control={form.control}
                name="prompt"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Endpoint Definition</FormLabel>
                    <FormControl>
                      <Textarea
                        className="min-h-[300px] font-code text-sm"
                        placeholder="Paste your endpoint definition here..."
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
          <CardTitle>Generated Documentation</CardTitle>
          <CardDescription>
            The generated documentation will appear here.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="prose prose-sm prose-invert max-w-none rounded-lg border bg-card-foreground/5 p-4 h-full min-h-[400px]">
             {state.data ? (
              <div dangerouslySetInnerHTML={{ __html: state.data.replace(/\n/g, '<br />') }} />
            ) : (
              <p className="text-muted-foreground">Awaiting generation...</p>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
