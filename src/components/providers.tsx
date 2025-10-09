'use client';

import { QueryClientProvider } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import { NuqsAdapter } from 'nuqs/adapters/next/app';

import { getQueryClient } from '~/lib/query';

const client = getQueryClient();

export function Providers({ children }: React.PropsWithChildren) {
  return (
    <QueryClientProvider client={client}>
      <NuqsAdapter>{children}</NuqsAdapter>
      <ReactQueryDevtools />
    </QueryClientProvider>
  );
}
