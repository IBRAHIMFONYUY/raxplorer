'use client';

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Textarea } from '@/components/ui/textarea';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { useState, useEffect, useActionState } from 'react';
import { Clock, History, Loader2, Sparkles, Trash2 } from 'lucide-react';
import { useSearchParams } from 'next/navigation';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import { generateRequestFromPrompt, GenerateRequestOutput } from '@/ai/flows/request-generation';

type KeyValue = {
  key: string;
  value: string;
};

type ResponseData = {
  status: number;
  statusText: string;
  time: string;
  size: string;
  headers: Record<string, string>;
  body: any;
  timing: Record<string, number>;
};

type HistoryItem = {
  id: string;
  method: string;
  url: string;
  status: number;
  time: string;
  queryParams: KeyValue[];
  headers: KeyValue[];
  body: string;
  response?: ResponseData;
};

const COMMON_HEADERS = [
  'Authorization',
  'Content-Type',
  'Accept',
  'X-Request-ID',
  'User-Agent',
  'Cache-Control',
  'Accept-Encoding',
  'Accept-Language',
];

async function generateRequestAction(currentState: any, formData: FormData) {
    const prompt = formData.get('prompt') as string;
    if (!prompt) return { message: 'Prompt is empty' };

    try {
        const result = await generateRequestFromPrompt({ prompt });
        return { message: 'Success', data: result };
    } catch (error) {
        console.error(error);
        return { message: 'Failed to generate request' };
    }
}


export default function ApiPlaygroundPage() {
  const searchParams = useSearchParams();
  const [method, setMethod] = useState('GET');
  const [url, setUrl] = useState('https://jsonplaceholder.typicode.com/users/1');
  const [queryParams, setQueryParams] = useState<KeyValue[]>([]);
  const [headers, setHeaders] = useState<KeyValue[]>([]);
  const [body, setBody] = useState('');
  const [response, setResponse] = useState<ResponseData | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [headerSuggestions, setHeaderSuggestions] = useState<string[]>([]);
  const [activeSuggestionIndex, setActiveSuggestionIndex] = useState(-1);
  const [history, setHistory] = useState<HistoryItem[]>([]);
  const [authMethod, setAuthMethod] = useState('none');
  const [bearerToken, setBearerToken] = useState('');

  const [aiState, aiFormAction, isAiPending] = useActionState(generateRequestAction, { data: null });

  useEffect(() => {
    if (aiState?.data) {
      const { method, url, queryParams, headers, body } = aiState.data as GenerateRequestOutput;
      setMethod(method);
      setUrl(url);
      setQueryParams(queryParams || []);
      setHeaders(headers || []);
      setBody(body || '');
    }
  }, [aiState]);


  useEffect(() => {
    const challengeId = searchParams.get('challengeId');
    if (challengeId) {
      setMethod(searchParams.get('method') || 'GET');
      setUrl(searchParams.get('url') || '');
      setBody(searchParams.get('body') || '');

      const headersParam = searchParams.get('headers');
      if (headersParam) {
        try {
          setHeaders(JSON.parse(headersParam));
        } catch (e) {
          setHeaders([]);
        }
      } else {
        setHeaders([]);
      }

      const queryParamsParam = searchParams.get('queryParams');
      if (queryParamsParam) {
        try {
          setQueryParams(JSON.parse(queryParamsParam));
        } catch (e) {
          setQueryParams([]);
        }
      } else {
        setQueryParams([]);
      }
    }
  }, [searchParams]);

  const handleSend = async () => {
    setIsLoading(true);
    setResponse(null);

    const timing = {
      start: Date.now(),
      dnsLookup: 0,
      tcpConnection: 0,
      tlsHandshake: 0,
      firstByte: 0,
      contentTransfer: 0,
      total: 0,
    };

    let res;
    let finalStatus = 500;
    let finalStatusText = 'Client Error';
    let fullResponse: ResponseData | null = null;
    try {
      const requestHeaders = new Headers();
      headers.forEach(header => {
        if (header.key && header.value) {
          requestHeaders.append(header.key, header.value);
        }
      });
      
      if (authMethod === 'bearer' && bearerToken) {
        requestHeaders.set('Authorization', `Bearer ${bearerToken}`);
      }

      if (!['GET', 'HEAD'].includes(method) && body) {
        if (!requestHeaders.has('Content-Type')) {
          requestHeaders.append('Content-Type', 'application/json');
        }
      }

      let requestUrl = url;
      if (queryParams.length > 0) {
        const params = new URLSearchParams();
        queryParams.forEach(param => {
          if (param.key) {
            params.append(param.key, param.value);
          }
        });
        requestUrl += `?${params.toString()}`;
      }

      timing.dnsLookup = Date.now();
      res = await fetch(requestUrl, {
        method,
        headers: requestHeaders,
        body: !['GET', 'HEAD'].includes(method) ? body : undefined,
      });
      timing.tcpConnection = Date.now();
      timing.tlsHandshake = Date.now();
      timing.firstByte = Date.now();
      finalStatus = res.status;
      finalStatusText = res.statusText;

      const responseText = await res.text();
      timing.contentTransfer = Date.now();

      let responseBody;
      try {
        responseBody = JSON.parse(responseText);
      } catch {
        responseBody = responseText;
      }

      const responseSize = responseText.length;
      timing.total = Date.now();

      const responseHeaders: Record<string, string> = {};
      res.headers.forEach((value, key) => {
        responseHeaders[key] = value;
      });

      fullResponse = {
        status: res.status,
        statusText: res.statusText,
        time: `${timing.total - timing.start}ms`,
        size: `${(responseSize / 1024).toFixed(2)} KB`,
        headers: responseHeaders,
        body: JSON.stringify(responseBody, null, 2),
        timing: {
          'DNS Lookup': timing.dnsLookup - timing.start,
          'TCP Connection': timing.tcpConnection - timing.dnsLookup,
          'TLS Handshake': timing.tlsHandshake - timing.tcpConnection,
          'Time to First Byte (TTFB)': timing.firstByte - timing.tlsHandshake,
          'Content Transfer': timing.contentTransfer - timing.firstByte,
          Total: timing.total - timing.start,
        },
      };
      setResponse(fullResponse);
    } catch (error) {
      timing.total = Date.now();
      fullResponse = {
        status: 500,
        statusText: 'Client Error',
        time: `${timing.total - timing.start}ms`,
        size: '0 KB',
        headers: {},
        body: JSON.stringify(
          {
            error:
              error instanceof Error
                ? error.message
                : 'An unknown error occurred',
          },
          null,
          2
        ),
        timing: { Total: timing.total - timing.start },
      };
      setResponse(fullResponse);
    } finally {
      addToHistory(method, url, queryParams, headers, body, fullResponse);
      setIsLoading(false);
    }
  };

  const addToHistory = (
    method: string,
    url: string,
    queryParams: KeyValue[],
    headers: KeyValue[],
    body: string,
    response: ResponseData | null
  ) => {
    const newHistoryItem: HistoryItem = {
      id: Date.now().toString(),
      method,
      url,
      status: response?.status || 500,
      time: response?.time || '0ms',
      queryParams,
      headers,
      body,
      response: response || undefined,
    };
    setHistory(prev => [newHistoryItem, ...prev].slice(0, 20)); // Keep last 20 requests
  };

  const loadFromHistory = (item: HistoryItem) => {
    setMethod(item.method);
    setUrl(item.url);
    setQueryParams(item.queryParams);
    setHeaders(item.headers);
    setBody(item.body);
    setResponse(item.response || null);
  };

  const addRow = (setter: React.Dispatch<React.SetStateAction<KeyValue[]>>) => {
    setter(prev => [...prev, { key: '', value: '' }]);
  };

  const removeRow = (
    setter: React.Dispatch<React.SetStateAction<KeyValue[]>>,
    index: number
  ) => {
    setter(prev => prev.filter((_, i) => i !== index));
  };

  const updateRow = (
    setter: React.Dispatch<React.SetStateAction<KeyValue[]>>,
    index: number,
    field: 'key' | 'value',
    val: string
  ) => {
    setter(prev =>
      prev.map((item, i) => (i === index ? { ...item, [field]: val } : item))
    );
    if (field === 'key') {
      if (val.trim() === '') {
        setHeaderSuggestions([]);
      } else {
        const filtered = COMMON_HEADERS.filter(
          h =>
            h.toLowerCase().includes(val.toLowerCase()) &&
            h.toLowerCase() !== val.toLowerCase()
        );
        setHeaderSuggestions(filtered);
      }
      setActiveSuggestionIndex(-1);
    }
  };

  const handleSuggestionClick = (
    setter: React.Dispatch<React.SetStateAction<KeyValue[]>>,
    index: number,
    suggestion: string
  ) => {
    updateRow(setter, index, 'key', suggestion);
    setHeaderSuggestions([]);
  };

  const handleHeaderKeyDown = (
    e: React.KeyboardEvent<HTMLInputElement>,
    setter: React.Dispatch<React.SetStateAction<KeyValue[]>>,
    index: number
  ) => {
    if (headerSuggestions.length > 0) {
      if (e.key === 'ArrowDown') {
        e.preventDefault();
        setActiveSuggestionIndex(prev =>
          prev < headerSuggestions.length - 1 ? prev + 1 : 0
        );
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        setActiveSuggestionIndex(prev =>
          prev > 0 ? prev - 1 : headerSuggestions.length - 1
        );
      } else if (e.key === 'Enter' && activeSuggestionIndex !== -1) {
        e.preventDefault();
        handleSuggestionClick(
          setter,
          index,
          headerSuggestions[activeSuggestionIndex]
        );
      } else if (e.key === 'Escape') {
        setHeaderSuggestions([]);
      }
    }
  };

  const KeyValueTable = ({
    data,
    setter,
    keyPlaceholder,
    valuePlaceholder,
    isHeaders = false,
  }: {
    data: KeyValue[];
    setter: React.Dispatch<React.SetStateAction<KeyValue[]>>;
    keyPlaceholder: string;
    valuePlaceholder: string;
    isHeaders?: boolean;
  }) => (
    <>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Key</TableHead>
            <TableHead>Value</TableHead>
            <TableHead className="w-[50px]"></TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {data.map((item, index) => (
            <TableRow key={index}>
              <TableCell className="relative p-2">
                <Input
                  value={item.key}
                  onChange={e =>
                    updateRow(setter, index, 'key', e.target.value)
                  }
                  onKeyDown={e => isHeaders && handleHeaderKeyDown(e, setter, index)}
                  onBlur={() => setTimeout(() => setHeaderSuggestions([]), 100)}
                  placeholder={keyPlaceholder}
                  className="font-code"
                />
                {isHeaders && headerSuggestions.length > 0 && (
                  <ul
                    className="absolute z-10 w-full mt-1 bg-card border rounded-md shadow-lg max-h-40 overflow-y-auto"
                  >
                    {headerSuggestions.map((suggestion, sIndex) => (
                      <li
                        key={suggestion}
                        className={`p-2 cursor-pointer hover:bg-secondary ${
                          sIndex === activeSuggestionIndex ? 'bg-secondary' : ''
                        }`}
                        onMouseDown={() =>
                          handleSuggestionClick(setter, index, suggestion)
                        }
                      >
                        {suggestion}
                      </li>
                    ))}
                  </ul>
                )}
              </TableCell>
              <TableCell className="p-2">
                <Input
                  value={item.value}
                  onChange={e =>
                    updateRow(setter, index, 'value', e.target.value)
                  }
                  placeholder={valuePlaceholder}
                  className="font-code"
                />
              </TableCell>
              <TableCell className="p-2">
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => removeRow(setter, index)}
                >
                  <Trash2 className="h-4 w-4 text-muted-foreground" />
                </Button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
      <Button
        variant="outline"
        size="sm"
        onClick={() => addRow(setter)}
        className="mt-2"
      >
        Add Row
      </Button>
    </>
  );

  const HistoryItemDetails = ({ item }: { item: HistoryItem }) => (
    <div className="space-y-6 text-sm">
      <div>
        <h3 className="font-semibold text-base mb-2">Request</h3>
        <div className="space-y-1">
          <div>
            <span className="font-medium">Method:</span>{' '}
            <Badge variant="outline">{item.method}</Badge>
          </div>
          <div className="font-medium">URL:</div>
          <div className="font-code bg-secondary p-2 rounded-md break-all">
            {item.url}
          </div>
        </div>
      </div>

      {item.queryParams.length > 0 && (
        <div>
          <h4 className="font-semibold mb-2">Query Params</h4>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Key</TableHead>
                <TableHead>Value</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {item.queryParams.map(p => (
                <TableRow key={p.key}>
                  <TableCell>{p.key}</TableCell>
                  <TableCell>{p.value}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}

      {item.headers.length > 0 && (
        <div>
          <h4 className="font-semibold mb-2">Headers</h4>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Key</TableHead>
                <TableHead>Value</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {item.headers.map(h => (
                <TableRow key={h.key}>
                  <TableCell>{h.key}</TableCell>
                  <TableCell>{h.value}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}

      {item.body && (
        <div>
          <h4 className="font-semibold mb-2">Body</h4>
          <pre className="w-full h-full overflow-auto rounded-md bg-secondary p-4 text-sm">
            <code className="font-code text-secondary-foreground">
              {item.body}
            </code>
          </pre>
        </div>
      )}

      {item.response && (
        <div>
          <h3 className="font-semibold text-base mb-2">Response</h3>
          <div className="flex items-center gap-4 text-sm mb-2">
            <div className="flex items-center gap-2">
              <span
                className={`h-2 w-2 rounded-full ${
                  item.response.status >= 200 && item.response.status < 300
                    ? 'bg-green-500'
                    : 'bg-red-500'
                }`}
              ></span>
              <span>
                Status: {item.response.status} {item.response.statusText}
              </span>
            </div>
            <span>Time: {item.response.time}</span>
            <span>Size: {item.response.size}</span>
          </div>
          <div>
            <h4 className="font-semibold mb-2">Body</h4>
            <pre className="w-full h-full overflow-auto rounded-md bg-secondary p-4 text-sm">
              <code className="font-code text-secondary-foreground">
                {item.response.body}
              </code>
            </pre>
          </div>
        </div>
      )}
    </div>
  );

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-col w-full space-y-4">
        <Card>
          <CardHeader>
             <CardTitle className="flex items-center gap-2">
              <Sparkles className="text-primary" />
              AI Assistant
            </CardTitle>
            <CardDescription>
              Describe the request you want to make in plain English, and the AI will build it for you.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form action={aiFormAction} className="flex items-center gap-2">
              <Input
                name="prompt"
                placeholder='e.g., "Get the first 5 comments for post ID 1 from jsonplaceholder"'
                className="text-base flex-1"
                disabled={isAiPending}
              />
              <Button type="submit" disabled={isAiPending}>
                {isAiPending && (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                )}
                {isAiPending ? 'Generating...' : 'Generate'}
              </Button>
            </form>
          </CardContent>
        </Card>


        <Card>
          <CardHeader>
            <CardTitle>Request</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2 mb-4">
              <Select value={method} onValueChange={setMethod}>
                <SelectTrigger className="w-[120px] font-bold">
                  <SelectValue placeholder="Method" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="GET">GET</SelectItem>
                  <SelectItem value="POST">POST</SelectItem>
                  <SelectItem value="PUT">PUT</SelectItem>
                  <SelectItem value="PATCH">PATCH</SelectItem>
                  <SelectItem value="DELETE">DELETE</SelectItem>
                </SelectContent>
              </Select>
              <Input
                value={url}
                onChange={e => setUrl(e.target.value)}
                placeholder="https://api.example.com/v1/users"
                className="text-base flex-1"
              />
              <Button onClick={handleSend} disabled={isLoading}>
                {isLoading && (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                )}
                {isLoading ? 'Sending...' : 'Send'}
              </Button>
            </div>
            <Tabs defaultValue="params" className="w-full">
              <TabsList>
                <TabsTrigger value="params">Params</TabsTrigger>
                <TabsTrigger value="auth">Authorization</TabsTrigger>
                <TabsTrigger value="headers">Headers</TabsTrigger>
                <TabsTrigger value="body">Body</TabsTrigger>
              </TabsList>
              <TabsContent value="params" className="mt-4">
                <KeyValueTable
                  data={queryParams}
                  setter={setQueryParams}
                  keyPlaceholder="page"
                  valuePlaceholder="1"
                />
              </TabsContent>
              <TabsContent value="auth" className="mt-4">
                <div className="w-full md:w-1/2 space-y-4">
                  <Select value={authMethod} onValueChange={setAuthMethod}>
                    <SelectTrigger>
                      <SelectValue placeholder="Auth Method" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="none">No Auth</SelectItem>
                      <SelectItem value="bearer">Bearer Token</SelectItem>
                    </SelectContent>
                  </Select>
                  {authMethod === 'bearer' && (
                    <Input
                      placeholder="Token"
                      value={bearerToken}
                      onChange={e => setBearerToken(e.target.value)}
                      className="font-code"
                    />
                  )}
                </div>
              </TabsContent>
              <TabsContent value="headers" className="mt-4">
                <KeyValueTable
                  data={headers}
                  setter={setHeaders}
                  keyPlaceholder="Authorization"
                  valuePlaceholder="Bearer ..."
                  isHeaders={true}
                />
              </TabsContent>
              <TabsContent value="body" className="mt-4">
                <Textarea
                  placeholder='{ "key": "value" }'
                  className="h-40 font-code"
                  value={body}
                  onChange={e => setBody(e.target.value)}
                  disabled={method === 'GET' || method === 'HEAD'}
                />
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Response</CardTitle>
            {response && (
              <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-sm text-muted-foreground">
                <div className="flex items-center gap-2">
                  <span
                    className={`h-2 w-2 rounded-full ${
                      response.status >= 200 && response.status < 300
                        ? 'bg-green-500'
                        : 'bg-red-500'
                    }`}
                  ></span>
                  <span>
                    Status: {response.status} {response.statusText}
                  </span>
                </div>
                <span>Time: {response.time}</span>
                <span>Size: {response.size}</span>
              </div>
            )}
          </CardHeader>
          <CardContent>
            {isLoading && (
              <div className="flex items-center justify-center min-h-[200px]">
                <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                <p>Loading response...</p>
              </div>
            )}
            {!isLoading && !response && (
              <div className="min-h-[200px] flex items-center justify-center text-muted-foreground">
                <p>Click "Send" to get a response</p>
              </div>
            )}
            {response && (
              <Tabs defaultValue="body" className="w-full">
                <TabsList>
                  <TabsTrigger value="body">Body</TabsTrigger>
                  <TabsTrigger value="headers">Headers</TabsTrigger>
                  <TabsTrigger value="timing">Timing</TabsTrigger>
                </TabsList>
                <TabsContent value="body" className="mt-4">
                  <ScrollArea className="h-48">
                    <pre className="w-full overflow-auto rounded-md bg-secondary p-4 text-sm">
                      <code className="font-code text-secondary-foreground">
                        {response.body}
                      </code>
                    </pre>
                  </ScrollArea>
                </TabsContent>
                <TabsContent value="headers" className="mt-4">
                  <ScrollArea className="h-48">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Key</TableHead>
                          <TableHead>Value</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {Object.entries(response.headers).map(
                          ([key, value]: [string, string]) => (
                            <TableRow key={key}>
                              <TableCell className="font-medium">{key}</TableCell>
                              <TableCell>{value}</TableCell>
                            </TableRow>
                          )
                        )}
                      </TableBody>
                    </Table>
                   </ScrollArea>
                </TabsContent>
                <TabsContent value="timing" className="mt-4">
                  <ScrollArea className="h-48">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Phase</TableHead>
                          <TableHead>Duration (ms)</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {Object.entries(response.timing).map(
                          ([phase, duration]) => (
                            <TableRow key={phase}>
                              <TableCell className="font-medium">
                                {phase}
                              </TableCell>
                              <TableCell>{duration.toFixed(2)}</TableCell>
                            </TableRow>
                          )
                        )}
                      </TableBody>
                    </Table>
                  </ScrollArea>
                </TabsContent>
              </Tabs>
            )}
          </CardContent>
        </Card>
      </div>
        
      <Accordion type="single" collapsible className="w-full">
        <AccordionItem value="history">
          <AccordionTrigger>
            <div className="flex items-center gap-2 text-lg font-semibold">
              <History className="h-5 w-5" />
              Request History
            </div>
          </AccordionTrigger>
          <AccordionContent>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <CardDescription>A list of your 20 most recent API requests.</CardDescription>
                <Button variant="ghost" size="sm" onClick={() => setHistory([])} disabled={history.length === 0}>Clear</Button>
              </CardHeader>
              <CardContent>
                {history.length > 0 ? (
                  <ScrollArea className="h-48">
                    <div className="space-y-1">
                      {history.map(item => (
                        <Dialog key={item.id}>
                          <DialogTrigger asChild>
                            <button className="w-full text-left p-2 rounded-md hover:bg-secondary">
                              <div className="flex justify-between items-center">
                                <span className={`font-bold ${item.method === 'GET' ? 'text-blue-400' : 'text-green-400'}`}>{item.method}</span>
                                <span className={`px-2 py-0.5 rounded-full text-xs ${item.status >= 200 && item.status < 300 ? 'bg-green-500/20 text-green-300' : 'bg-red-500/20 text-red-300'}`}>{item.status}</span>
                              </div>
                              <p className="text-sm text-muted-foreground truncate">{item.url}</p>
                              <div className="text-xs text-muted-foreground flex items-center gap-1 mt-1"><Clock className="h-3 w-3" />{item.time}</div>
                            </button>
                          </DialogTrigger>
                          <DialogContent className="max-w-3xl">
                            <DialogHeader>
                              <DialogTitle>History Details</DialogTitle>
                              <CardDescription>
                                A detailed view of a request from {new Date(parseInt(item.id)).toLocaleString()}.
                                <Button size="sm" variant="outline" className="ml-4" onClick={() => {loadFromHistory(item)}}>Load Request</Button>
                              </CardDescription>
                            </DialogHeader>
                            <ScrollArea className="max-h-[60vh]">
                              <div className="p-1">
                                <HistoryItemDetails item={item} />
                              </div>
                            </ScrollArea>
                          </DialogContent>
                        </Dialog>
                      ))}
                    </div>
                  </ScrollArea>
                ) : (
                  <div className="h-full flex items-center justify-center p-8">
                    <p className="text-muted-foreground text-sm">No history yet. Your requests will appear here.</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </AccordionContent>
        </AccordionItem>
      </Accordion>
    </div>
  );
}
