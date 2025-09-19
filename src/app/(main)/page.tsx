'use client';

import { Suspense } from 'react';
import { ApiPlayground } from './_components/api-playground';
import { Loader2 } from 'lucide-react';

function PlaygroundLoader() {
  return (
    <div className="flex items-center justify-center min-h-[80vh]">
      <Loader2 className="mr-2 h-8 w-8 animate-spin" />
      <p className="text-lg">Loading Playground...</p>
    </div>
  );
}

export default function ApiPlaygroundPage() {
  return (
    <Suspense fallback={<PlaygroundLoader />}>
      <ApiPlayground />
    </Suspense>
  );
}
