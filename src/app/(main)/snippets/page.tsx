'use client';

import { useActionState, useEffect } from 'react';
import { useForm, useFormContext } from 'react-hook-form';
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

import { generateSnippetAction } from './actions';
import { useToast } from '@/hooks/use-toast';
import { Loader2 } from 'lucide-react';

const formSchema = z.object({
  prompt: z
    .string()
    .min(10, 'Please provide a more detailed description (min 10 characters).')
    .max(2000, 'Description is too long (max 2000 characters).'),
  language: z.enum(['Node.js', 'Python', 'Go']),
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
        'Generate Snippet'
      )}
    </Button>
  );
}

export default function CodeSnippetsPage() {
  const [state, formAction] = useActionState(generateSnippetAction, initialState);
  const { toast } = useToast();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      prompt: 'GET request to /api/v1/users to fetch a list of all users.',
      language: 'Node.js',
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
          <CardTitle>Code Snippet Generation</CardTitle>
          <CardDescription>
            Generate code snippets for API requests in various languages.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form
              action={formAction}
              className="space-y-6"
              onSubmit={form.handleSubmit(() => formAction(new FormData(form.control._formRef.current)))}
            >
              <FormField
                control={form.control}
                name="prompt"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Endpoint Definition</FormLabel>
                    <FormControl>
                      <Textarea
                        className="min-h-[200px] font-code text-sm"
                        placeholder="e.g., A POST request to /login with email and password in the body."
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="language"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Language</FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                      name={field.name}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select a language" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="Node.js">Node.js</SelectItem>
                        <SelectItem value="Python">Python</SelectItem>
                        <SelectItem value="Go">Go</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <SubmitButton />
            </form>
          </Form>
        </CardContent>
      </Card>
      <Card>
        <CardHeader>
          <CardTitle>Generated Code Snippet</CardTitle>
          <CardDescription>
            The generated code for your selected language will appear here.
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
