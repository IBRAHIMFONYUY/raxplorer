'use client';

import { useActionState, useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
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
  FormItem,
  FormLabel,
  FormMessage,
  FormField,
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
  language: z.enum(['JavaScript', 'TypeScript', 'Node.js', 'Python', 'Go', 'Java', 'C#', 'Ruby']),
});

const initialState = {
  message: '',
  errors: null,
  data: null,
};


export default function CodeSnippetsPage() {
  const [state, formAction, isPending] = useActionState(generateSnippetAction, initialState);
  const { toast } = useToast();
  const [creativity, setCreativity] = useState(0.5);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      prompt: 'GET request to /api/v1/users to fetch a list of all users.',
      language: 'JavaScript',
    },
  });

  useEffect(() => {
    const storedCreativity = localStorage.getItem('aiCreativity');
    if (storedCreativity) {
      setCreativity(parseFloat(storedCreativity));
    }
    const storedSnippetLang = localStorage.getItem('snippetLanguage') as z.infer<typeof formSchema>['language'] | null;
    if (storedSnippetLang) {
      form.setValue('language', storedSnippetLang);
    }
  }, [form]);


  useEffect(() => {
    if (state.message && state.message !== 'Success') {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: state.message,
      });
    }
    if (state.errors) {
       const fieldErrors = state.errors as { prompt?: string[], language?: string[] };
       if (fieldErrors.prompt?.[0]) {
         form.setError('prompt', { message: fieldErrors.prompt[0] });
       }
       if (fieldErrors.language?.[0]) {
         form.setError('language', { message: fieldErrors.language[0] });
       }
    }
  }, [state, toast, form]);

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
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select a language" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="JavaScript">JavaScript</SelectItem>
                        <SelectItem value="TypeScript">TypeScript</SelectItem>
                        <SelectItem value="Node.js">Node.js</SelectItem>
                        <SelectItem value="Python">Python</SelectItem>
                        <SelectItem value="Go">Go</SelectItem>
                        <SelectItem value="Java">Java</SelectItem>
                        <SelectItem value="C#">C#</SelectItem>
                        <SelectItem value="Ruby">Ruby</SelectItem>
                      </SelectContent>
                    </Select>
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
                  'Generate Snippet'
                )}
              </Button>
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
          <pre className="h-full min-h-[400px] w-full overflow-auto rounded-lg bg-secondary p-4 text-secondary-foreground whitespace-pre-wrap">
            <code className="font-code text-sm">
              {isPending && !state.data ? (
                <div className="flex items-center justify-center h-full">
                    <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                    <p>Generating snippet...</p>
                </div>
              ) : state.data ? state.data : 'Awaiting generation...'}
            </code>
          </pre>
        </CardContent>
      </Card>
    </div>
  );
}
