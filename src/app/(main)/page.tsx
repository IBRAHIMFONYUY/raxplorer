'use client';

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
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
import { Key, useState, useEffect, useRef } from 'react';
import { Loader2 } from 'lucide-react';
import { useSearchParams } from 'next/navigation';

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
  const suggestionBoxRef = useRef<HTMLUListElement>(null);

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
    try {
      const requestHeaders = new Headers();
      headers.forEach(header => {
        if (header.key && header.value) {
          requestHeaders.append(header.key, header.value);
        }
      });
      if (!['GET', 'HEAD'].includes(method) && body) {
        requestHeaders.append('Content-Type', 'application/json');
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

      const responseBody = await res.json();
      timing.contentTransfer = Date.now();

      const responseSize = JSON.stringify(responseBody).length;
      timing.total = Date.now();

      const responseHeaders: Record<string, string> = {};
      res.headers.forEach((value, key) => {
        responseHeaders[key] = value;
      });

      setResponse({
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
          'Total': timing.total - timing.start,
        },
      });
    } catch (error) {
      timing.total = Date.now();
      setResponse({
        status: 500,
        statusText: 'Client Error',
        time: `${timing.total - timing.start}ms`,
        size: '0 KB',
        headers: {},
        body: JSON.stringify(
          {
            error:
              error instanceof Error ? error.message : 'An unknown error occurred',
          },
          null,
          2
        ),
        timing: { 'Total': timing.total - timing.start },
      });
    } finally {
      setIsLoading(false);
    }
  };

  const addRow = (
    setter: React.Dispatch<React.SetStateAction<KeyValue[]>>
  ) => {
    setter(prev => [...prev, { key: '', value: '' }]);
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
        const filtered = COMMON_HEADERS.filter(h => h.toLowerCase().includes(val.toLowerCase()) && h.toLowerCase() !== val.toLowerCase());
        setHeaderSuggestions(filtered);
      }
      setActiveSuggestionIndex(-1);
    }
  };

  const handleSuggestionClick = (setter: React.Dispatch<React.SetStateAction<KeyValue[]>>, index: number, suggestion: string) => {
    updateRow(setter, index, 'key', suggestion);
    setHeaderSuggestions([]);
  };

  const handleHeaderKeyDown = (e: React.KeyboardEvent<HTMLInputElement>, setter: React.Dispatch<React.SetStateAction<KeyValue[]>>, index: number) => {
    if (headerSuggestions.length > 0) {
      if (e.key === 'ArrowDown') {
        e.preventDefault();
        setActiveSuggestionIndex(prev => (prev < headerSuggestions.length - 1 ? prev + 1 : 0));
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        setActiveSuggestionIndex(prev => (prev > 0 ? prev - 1 : headerSuggestions.length - 1));
      } else if (e.key === 'Enter' && activeSuggestionIndex !== -1) {
        e.preventDefault();
        handleSuggestionClick(setter, index, headerSuggestions[activeSuggestionIndex]);
      } else if (e.key === 'Escape') {
        setHeaderSuggestions([]);
      }
    }
  };

  useEffect(() => {
    if (activeSuggestionIndex !== -1 && suggestionBoxRef.current) {
      const activeItem = suggestionBoxRef.current.children[activeSuggestionIndex];
      activeItem?.scrollIntoView({ block: 'nearest' });
    }
  }, [activeSuggestionIndex]);

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
          </TableRow>
        </TableHeader>
        <TableBody>
          {data.map((item, index) => (
            <TableRow key={index}>
              <TableCell className="relative">
                <Input
                  value={item.key}
                  onChange={e => updateRow(setter, index, 'key', e.target.value)}
                  onKeyDown={e => isHeaders && handleHeaderKeyDown(e, setter, index)}
                  onBlur={() => setTimeout(() => setHeaderSuggestions([]), 100)}
                  placeholder={keyPlaceholder}
                  className="font-code"
                />
                {isHeaders && headerSuggestions.length > 0 && (
                   <ul ref={suggestionBoxRef} className="absolute z-10 w-full mt-1 bg-card border rounded-md shadow-lg max-h-40 overflow-y-auto">
                    {headerSuggestions.map((suggestion, sIndex) => (
                      <li
                        key={suggestion}
                        className={`p-2 cursor-pointer hover:bg-secondary ${sIndex === activeSuggestionIndex ? 'bg-secondary' : ''}`}
                        onMouseDown={() => handleSuggestionClick(setter, index, suggestion)}
                      >
                        {suggestion}
                      </li>
                    ))}
                  </ul>
                )}
              </TableCell>
              <TableCell>
                <Input
                  value={item.value}
                  onChange={e =>
                    updateRow(setter, index, 'value', e.target.value)
                  }
                  placeholder={valuePlaceholder}
                  className="font-code"
                />
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

  return (
    <div className="flex h-full flex-col gap-6">
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Select value={method} onValueChange={setMethod}>
              <SelectTrigger className="w-[120px]">
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
            />
            <Button onClick={handleSend} disabled={isLoading}>
              {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {isLoading ? 'Sending...' : 'Send'}
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="params">
            <TabsList>
              <TabsTrigger value="params">Params</TabsTrigger>
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
                className="min-h-[200px] font-code"
                value={body}
                onChange={e => setBody(e.target.value)}
                disabled={method === 'GET' || method === 'HEAD'}
              />
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>

      {isLoading && (
        <div className="flex items-center justify-center rounded-lg border p-8">
          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          <p className="text-muted-foreground">Loading response...</p>
        </div>
      )}

      {response && (
        <Card>
          <CardHeader>
            <CardTitle>Response</CardTitle>
            <div className="flex items-center gap-4 text-sm">
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
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="body">
              <TabsList>
                <TabsTrigger value="body">Body</TabsTrigger>
                <TabsTrigger value="headers">Headers</TabsTrigger>
                <TabsTrigger value="timing">Timing</TabsTrigger>
              </TabsList>
              <TabsContent value="body" className="mt-4">
                <pre className="w-full overflow-auto rounded-md bg-secondary p-4 text-sm">
                  <code className="font-code text-secondary-foreground">
                    {response.body}
                  </code>
                </pre>
              </TabsContent>
              <TabsContent value="headers" className="mt-4">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Key</TableHead>
                      <TableHead>Value</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {Object.entries(response.headers).map(
                      ([key, value]: [
                        string,
                        string,
                      ]) => (
                        <TableRow key={key}>
                          <TableCell className="font-medium">{key}</TableCell>
                          <TableCell>{value}</TableCell>
                        </TableRow>
                      )
                    )}
                  </TableBody>
                </Table>
              </TabsContent>
              <TabsContent value="timing" className="mt-4">
                 <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Phase</TableHead>
                      <TableHead>Duration (ms)</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {Object.entries(response.timing).map(([phase, duration]) => (
                      <TableRow key={phase}>
                        <TableCell className="font-medium">{phase}</TableCell>
                        <TableCell>{duration.toFixed(2)}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
