import { MutationCache, QueryCache, QueryClient } from "@tanstack/react-query";
import { shouldRetryQuery } from "@/api/query-retry.ts";

export function createAppQueryClient(): QueryClient {
	return new QueryClient({
		queryCache: new QueryCache({
			onError: (error) => {
				console.error("[TanStack Query] Query failed", error);
			},
		}),
		mutationCache: new MutationCache({
			onError: (error) => {
				console.error("[TanStack Query] Mutation failed", error);
			},
		}),
		defaultOptions: {
			queries: {
				retry: shouldRetryQuery,
			},
		},
	});
}
