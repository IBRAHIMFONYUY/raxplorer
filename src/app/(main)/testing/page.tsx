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
import { generateTestCasesAction } from './actions';
import { useToast } from '@/hooks/use-toast';
import { Loader2 } from 'lucide-react';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import { Badge } from '@/components/ui/badge';

const formSchema = z.object({
  apiDefinition: z
    .string()
    .min(10, 'Please provide a more detailed API definition (min 10 characters).'),
  dataModel: z.string().optional(),
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
        'Generate Test Cases'
      )}
    </Button>
  );
}

export default function AiTestingPage() {
  const [state, formAction] = useActionState(generateTestCasesAction, initialState);
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
      apiDefinition:
        'Endpoint: POST /api/v1/users\nDescription: Creates a new user.',
      dataModel: `{
  "type": "object",
  "properties": {
    "name": { "type": "string" },
    "email": { "type": "string", "format": "email" }
  },
  "required": ["name", "email"]
}`,
    },
  });

  const { handleSubmit, formState } = form;

  const handleFormAction = (data: z.infer<typeof formSchema>) => {
    const formData = new FormData();
    formData.append('apiDefinition', data.apiDefinition);
    if (data.dataModel) {
      formData.append('dataModel', data.dataModel);
    }
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
          <CardTitle>AI-Driven Testing</CardTitle>
          <CardDescription>
            Automatically generate test cases for your API endpoints.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <FormProvider {...form}>
            <form onSubmit={handleSubmit(handleFormAction)} className="space-y-6">
              <FormField
                control={form.control}
                name="apiDefinition"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>API Definition</FormLabel>
                    <FormControl>
                      <Textarea
                        className="min-h-[150px] font-code text-sm"
                        placeholder="Paste your API definition here..."
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="dataModel"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Data Model (Optional)</FormLabel>
                    <FormControl>
                      <Textarea
                        className="min-h-[150px] font-code text-sm"
                        placeholder="Paste the JSON schema for your data model..."
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
          <CardTitle>Generated Test Cases</CardTitle>
          <CardDescription>
            The generated test cases will appear here.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {formState.isSubmitting && !state.data ? (
            <div className="flex items-center justify-center rounded-lg border p-8 h-full min-h-[400px]">
                <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                <p className="text-muted-foreground">Generating test cases...</p>
            </div>
          ) : state.data ? (
             <Accordion type="single" collapsible className="w-full">
              {(state.data as any[]).map((testCase: any, index: number) => (
                <AccordionItem value={`item-${index}`} key={index}>
                  <AccordionTrigger>
                    <div className="flex items-center gap-4">
                       <Badge variant={testCase.expectedResponse.statusCode >= 200 && testCase.expectedResponse.statusCode < 300 ? 'default' : 'destructive'}>
                        {testCase.request.method}
                      </Badge>
                      <span className="flex-1 text-left">{testCase.description}</span>
                    </div>
                  </AccordionTrigger>
                  <AccordionContent>
                    <div className="space-y-4 font-code text-xs">
                      <div>
                        <p className="font-semibold">Request Path:</p>
                        <p className="rounded bg-secondary p-2 mt-1">{testCase.request.path}</p>
                      </div>
                      {testCase.request.body && (
                        <div>
                          <p className="font-semibold">Request Body:</p>
                          <pre className="rounded bg-secondary p-2 mt-1">{JSON.stringify(testCase.request.body, null, 2)}</pre>
                        </div>
                      )}
                      <div>
                        <p className="font-semibold">Expected Status Code:</p>
                        <p className="rounded bg-secondary p-2 mt-1">{testCase.expectedResponse.statusCode}</p>
                      </div>
                    </div>
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          ) : (
            <div className="flex items-center justify-center rounded-lg border p-8 h-full min-h-[400px]">
              <p className="text-muted-foreground">Awaiting generation...</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
