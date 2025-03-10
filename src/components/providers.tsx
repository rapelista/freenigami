"use client";

import { QueryClientProvider } from "@tanstack/react-query";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import { getQueryClient } from "~/libs/query";

export function Providers({ children }: React.PropsWithChildren) {
  return (
    <QueryClientProvider client={getQueryClient()}>
      {children}

      <ReactQueryDevtools buttonPosition="bottom-right" />
    </QueryClientProvider>
  );
}
