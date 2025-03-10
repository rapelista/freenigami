"use client";

import { QueryClientProvider } from "@tanstack/react-query";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import { ThemeProvider as NextThemesProvider } from "next-themes";
import { getQueryClient } from "~/libs/query";

export function Providers({ children }: React.PropsWithChildren) {
  return (
    <NextThemesProvider
      attribute="class"
      defaultTheme="dark"
      enableSystem
      disableTransitionOnChange
    >
      <QueryClientProvider client={getQueryClient()}>
        {children}

        <ReactQueryDevtools buttonPosition="bottom-right" />
      </QueryClientProvider>
    </NextThemesProvider>
  );
}
