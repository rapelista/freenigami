import { isServer, QueryClient } from '@tanstack/react-query';

let queryClient: null | QueryClient = null;

function makeQueryClient() {
  return new QueryClient({
    defaultOptions: {
      queries: {
        staleTime: 1_000 * 60,
      },
    },
  });
}

export function getQueryClient() {
  if (isServer) {
    return makeQueryClient();
  }

  return (queryClient ??= makeQueryClient());
}
