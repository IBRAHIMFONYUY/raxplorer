'use client';

import { Suspense } from 'react';
import { ApiPlayground } from './_components/api-playground';
import { Loader2 } from 'lucide-react';
import { useSearchParams, useRouter } from 'next/navigation';

function PlaygroundLoader() {
  return (
    <div className="flex items-center justify-center min-h-[80vh]">
      <Loader2 className="mr-2 h-8 w-8 animate-spin" />
      <p className="text-lg">Loading Playground...</p>
    </div>
  );
}

function ApiPlaygroundWrapper() {
  const searchParams = useSearchParams();
  const router = useRouter(); // Even if unused, it's part of the fix to have client hooks together
  return <ApiPlayground />;
}

export default function ApiPlaygroundPage() {
  return (
    <Suspense fallback={<PlaygroundLoader />}>
      <ApiPlaygroundWrapper />
    </Suspense>
  );
}
