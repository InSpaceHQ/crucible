import { useEffect } from "react";
import { useQuery, usePaginatedQuery } from "convex/react";
import { isEqual, serialize } from "ohash";
import type { FunctionReference } from "convex/server";
import { getFunctionName } from "convex/server";

const queryCache = new Map<string, unknown>();
const paginatedCache = new Map<string, unknown[]>();
const paginatedStatusCache = new Map<string, string>();

function makeKey(query: FunctionReference<"query">, args?: unknown): string {
  return `${getFunctionName(query)}::${serialize(args ?? {})}`;
}

export function useCachedQuery<Q extends FunctionReference<"query", "public">>(
  query: Q,
  args?: Omit<Q["_args"], "paginationOpts">,
): Q["_returnType"] | undefined {
  const key = makeKey(query, args);
  // biome-ignore lint/suspicious/noExplicitAny: args type is safely constrained by Q
  const result = useQuery(query, args as any);

  useEffect(() => {
    if (result !== undefined) {
      queryCache.set(key, result);
    }
  }, [result, key]);

  const cached = queryCache.get(key) as Q["_returnType"] | undefined;
  if (result === undefined && cached !== undefined) {
    return cached;
  }
  if (result !== undefined && cached !== undefined && isEqual(result, cached)) {
    return cached;
  }
  return result;
}

type PaginatedResult<T> = {
  results: T[];
  status: "LoadingFirstPage" | "CanLoadMore" | "Exhausted" | "LoadingMore";
  isLoading: boolean;
  loadMore: (numItems: number) => void;
};

export function useCachedPaginatedQuery(
  query: FunctionReference<"query", "public">,
  args: Record<string, unknown>,
  opts: { initialNumItems: number },
  // biome-ignore lint/suspicious/noExplicitAny: paginated item type is inferred from the query function
): PaginatedResult<any> {
  const key = makeKey(query, args);
  // biome-ignore lint/suspicious/noExplicitAny: args type is constrained by the paginated query signature
  const result = usePaginatedQuery(query, args as any, opts);

  useEffect(() => {
    if (result.results.length > 0) {
      paginatedCache.set(key, result.results);
      paginatedStatusCache.set(key, result.status);
    }
  }, [result.results, result.status, key]);

  const cached = paginatedCache.get(key);
  if (result.results.length === 0 && cached && cached.length > 0) {
    return {
      ...result,
      results: cached,
      isLoading: false,
      // biome-ignore lint/suspicious/noExplicitAny: status string is one of the PaginatedResult literals
      status: (paginatedStatusCache.get(key) ?? "LoadingMore") as any,
    };
  }
  // biome-ignore lint/suspicious/noExplicitAny: cached results array is compared structurally
  if (
    result.results.length > 0 &&
    cached &&
    isEqual(result.results, cached as any)
  ) {
    return { ...result, results: cached };
  }
  return result;
}
