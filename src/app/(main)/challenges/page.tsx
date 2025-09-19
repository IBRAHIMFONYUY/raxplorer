import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";

const challenges = [
  {
    id: 'get-request',
    title: "The GET Requestor",
    description: "Learn how to fetch data from a public API using a simple GET request.",
    xp: 50,
    progress: 100,
    status: "Completed",
    request: {
      method: 'GET',
      url: 'https://jsonplaceholder.typicode.com/posts/1',
    }
  },
  {
    id: 'post-master',
    title: "POST Master",
    description: "Create a new resource on a mock server by sending data with a POST request.",
    xp: 75,
    progress: 40,
    status: "In Progress",
    request: {
      method: 'POST',
      url: 'https://jsonplaceholder.typicode.com/posts',
      body: JSON.stringify({ title: 'foo', body: 'bar', userId: 1 }, null, 2),
    }
  },
  {
    id: 'header-wizard',
    title: "Header Wizard",
    description: "Authenticate your request by correctly setting the Authorization header.",
    xp: 100,
    progress: 0,
    status: "Start",
    request: {
      method: 'GET',
      url: 'https://api.example.com/protected',
      headers: [{ key: 'Authorization', value: 'Bearer YOUR_TOKEN' }],
    }
  },
  {
    id: 'path-param-pro',
    title: "Path Parameter Pro",
    description: "Fetch a specific resource by using path parameters in your API request URL.",
    xp: 60,
    progress: 0,
    status: "Start",
    request: {
      method: 'GET',
      url: 'https://jsonplaceholder.typicode.com/comments/10',
    }
  },
   {
    id: 'query-ninja',
    title: "Query Ninja",
    description: "Filter and sort data from an API by using query parameters.",
    xp: 80,
    progress: 0,
    status: "Start",
    request: {
      method: 'GET',
      url: 'https://jsonplaceholder.typicode.com/comments',
      queryParams: [{ key: 'postId', value: '1' }],
    }
  },
  {
    id: 'error-handler',
    title: "Error Handler",
    description: "Intentionally trigger a 404 Not Found error and handle the response gracefully.",
    xp: 120,
    progress: 0,
    status: "Start",
    request: {
      method: 'GET',
      url: 'https://jsonplaceholder.typicode.com/posts/99999',
    }
  },
];

export default function ChallengesPage() {
  return (
    <div className="flex w-full flex-col">
      <div className="mb-6">
        <h1 className="text-3xl font-bold tracking-tight">Interactive Challenges</h1>
        <p className="text-muted-foreground">Learn APIs through interactive challenges and earn XP.</p>
      </div>

      <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
        {challenges.map((challenge) => (
          <Card key={challenge.id} className="flex flex-col">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>{challenge.title}</CardTitle>
                <Badge variant="secondary">{challenge.xp} XP</Badge>
              </div>
              <CardDescription>{challenge.description}</CardDescription>
            </CardHeader>
            <CardContent className="flex-grow">
              <Progress value={challenge.progress} aria-label={`${challenge.progress}% complete`} />
            </CardContent>
            <CardFooter>
              <Button asChild className="w-full" disabled={challenge.status === 'Completed'}>
                <Link href={{
                  pathname: '/',
                  query: {
                    challengeId: challenge.id,
                    method: challenge.request.method,
                    url: challenge.request.url,
                    body: challenge.request.body,
                    headers: challenge.request.headers ? JSON.stringify(challenge.request.headers) : undefined,
                    queryParams: challenge.request.queryParams ? JSON.stringify(challenge.request.queryParams) : undefined
                  }
                }}>
                  {challenge.status === 'Completed' ? 'Completed' : challenge.status === 'In Progress' ? 'Continue' : 'Start Challenge'}
                </Link>
              </Button>
            </CardFooter>
          </Card>
        ))}
      </div>
    </div>
  );
}
