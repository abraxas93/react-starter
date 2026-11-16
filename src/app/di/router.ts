import type { QueryClient } from "@tanstack/react-query";
import { createRouter, type RouterHistory } from "@tanstack/react-router";
import { routeTree } from "#/routeTree.gen";

export function createAppRouter(options: {
	queryClient: QueryClient;
	history?: RouterHistory;
}) {
	return createRouter({
		routeTree,
		history: options.history,
		context: { queryClient: options.queryClient },
		defaultPreload: "intent",
		// TanStack Query owns freshness; the router must not cache loader results.
		defaultPreloadStaleTime: 0,
		scrollRestoration: true,
	});
}

declare module "@tanstack/react-router" {
	interface Register {
		router: ReturnType<typeof createAppRouter>;
	}
}
