import { createFileRoute, stripSearchParams } from "@tanstack/react-router";
import { catalogQueryOptions } from "#/features/example-catalog";
import { ExamplesPage } from "#/pages/examples-page";
import {
	examplesSearchDefaults,
	examplesSearchSchema,
} from "#/pages/examples-page.search";

export const Route = createFileRoute("/examples")({
	validateSearch: examplesSearchSchema,
	// Keeps the default out of the URL, so links need no search and `/examples` stays clean.
	search: { middlewares: [stripSearchParams(examplesSearchDefaults)] },
	// Warms the cache on intent without blocking render; the feature renders query state.
	loader: ({ context }) => {
		void context.queryClient.prefetchQuery(catalogQueryOptions);
	},
	component: ExamplesPage,
});
