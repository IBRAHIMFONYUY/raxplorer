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
import { Badge } from '@/components/ui/badge';
import { useState } from 'react';

const mockResponse = {
  status: 200,
  statusText: 'OK',
  time: '128ms',
  size: '1.2 KB',
  headers: {
    'content-type': 'application/json; charset=utf-8',
    'cache-control': 'public, max-age=60, s-maxage=60',
    'x-powered-by': 'RaXplorer Mock Engine',
  },
  body: JSON.stringify(
    {
      id: 1,
      name: 'Leanne Graham',
      username: 'Bret',
      email: 'Sincere@april.biz',
      address: {
        street: 'Kulas Light',
        suite: 'Apt. 556',
        city: 'Gwenborough',
        zipcode: '92998-3874',
        geo: {
          lat: '-37.3159',
          lng: '81.1496',
        },
      },
    },
    null,
    2
  ),
};

export default function ApiPlaygroundPage() {
  const [response, setResponse] = useState<typeof mockResponse | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleSend = () => {
    setIsLoading(true);
    setTimeout(() => {
      setResponse(mockResponse);
      setIsLoading(false);
    }, 1000);
  };

  return (
    <div className="flex h-full flex-col gap-6">
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Select defaultValue="GET">
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
              defaultValue="https://api.raxplorer.app/users/1"
              placeholder="https://api.example.com/v1/users"
            />
            <Button onClick={handleSend} disabled={isLoading}>
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
              <p className="text-sm text-muted-foreground">
                Query parameters to be sent with the request.
              </p>
            </TabsContent>
            <TabsContent value="headers" className="mt-4">
              <p className="text-sm text-muted-foreground">
                Headers to be sent with the request.
              </p>
            </TabsContent>
            <TabsContent value="body" className="mt-4">
              <Textarea
                placeholder='{ "key": "value" }'
                className="min-h-[200px] font-code"
              />
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>

      {isLoading && (
        <div className="flex items-center justify-center rounded-lg border p-8">
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
                  className={`h-2 w-2 rounded-full ${response.status === 200 ? 'bg-green-500' : 'bg-red-500'}`}
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
                    {Object.entries(response.headers).map(([key, value]) => (
                      <TableRow key={key}>
                        <TableCell className="font-medium">{key}</TableCell>
                        <TableCell>{value}</TableCell>
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
