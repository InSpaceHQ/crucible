"use client";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import { persistQueryClient } from "@tanstack/react-query-persist-client";
import type {
  PersistedClient,
  Persister,
} from "@tanstack/react-query-persist-client";
import type { ReactNode } from "react";

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5,
      gcTime: 1000 * 60 * 60 * 24,
    },
  },
});

const LS_KEY = "tanstack-query";

const localStoragePersister: Persister = {
  persistClient: async (client: PersistedClient) => {
    localStorage.setItem(LS_KEY, JSON.stringify(client));
  },
  restoreClient: async () => {
    const raw = localStorage.getItem(LS_KEY);
    return raw ? (JSON.parse(raw) as PersistedClient) : undefined;
  },
  removeClient: async () => {
    localStorage.removeItem(LS_KEY);
  },
};

// if (typeof window !== "undefined") {
persistQueryClient({
  queryClient,
  persister: localStoragePersister,
  maxAge: 1000 * 60 * 60 * 24,
});
// }

export function QueryProvider({ children }: { children: ReactNode }) {
  return (
    <QueryClientProvider client={queryClient}>
      {children}
      <ReactQueryDevtools initialIsOpen={false} />
    </QueryClientProvider>
  );
}
