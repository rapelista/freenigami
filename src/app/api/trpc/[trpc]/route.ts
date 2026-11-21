import { fetchRequestHandler } from '@trpc/server/adapters/fetch';

import { appRouter } from '~/trpc/router';

function handler(req: Request) {
  return fetchRequestHandler({
    endpoint: '/api/trpc',
    req,
    router: appRouter,
    createContext: () => ({}),
  });
}
export { handler as GET, handler as POST };

// The anime catalog is fetched in full on a cold start (~2-3s gzipped,
// longer when the source is slow); don't let the default 10s cut it off.
export const maxDuration = 60;
