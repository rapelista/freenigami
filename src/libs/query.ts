import { isServer, QueryClient } from "@tanstack/react-query";

function makeQueryClient() {
  return new QueryClient({
    defaultOptions: {
      queries: {
        staleTime: 60 * 1000,
        queryFn: async ({ queryKey, signal }) => {
          const paths = queryKey.filter((key) => typeof key === "string");
          const url = paths.join("/");

          const search = new URLSearchParams();
          const params = queryKey.filter((key) => typeof key === "object");
          params.forEach((param) => {
            if (param) {
              Object.entries(param).forEach(([key, value]) => {
                search.append(key, String(value));
              });
            }
          });

          const searchParams = search.toString();

          const response = await fetch(
            "/v1/api/" + url + (searchParams ? "?" + searchParams : ""),
            { signal }
          );

          return await response.json();
        },
      },
    },
  });
}

let browserQueryClient: QueryClient | undefined = undefined;

export function getQueryClient() {
  if (isServer) {
    return makeQueryClient();
  } else {
    if (!browserQueryClient) browserQueryClient = makeQueryClient();
    return browserQueryClient;
  }
}
