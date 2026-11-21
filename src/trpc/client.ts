import { createTRPCClient, httpBatchStreamLink } from '@trpc/client';
import { createTRPCOptionsProxy } from '@trpc/tanstack-react-query';

import { getQueryClient } from '~/lib/query';
import type { AppRouter } from '~/trpc/router';

export const queryClient = getQueryClient();

const trpcClient = createTRPCClient<AppRouter>({
  // Streamed batches: each query in a batch resolves as soon as it is ready,
  // so a slow one (e.g. a cold anime catalog) does not hold back the rest.
  links: [httpBatchStreamLink({ url: '/api/trpc' })],
});

export const trpc = createTRPCOptionsProxy<AppRouter>({
  client: trpcClient,
  queryClient,
});
