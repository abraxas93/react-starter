import { createFileRoute } from "@tanstack/react-router";
import { catalogQueryOptions } from "#/features/example-catalog";
import { ExamplesPage } from "#/pages/examples-page";
import { examplesSearchSchema } from "#/pages/examples-page.search";
export const Route = createFileRoute("/examples")({
	validateSearch: (search) => examplesSearchSchema.parse(search),
	// Warms the cache on intent without blocking render; the feature renders query state.
	loader: ({ context }) => {
		void context.queryClient.prefetchQuery(catalogQueryOptions);
	},
	component: ExamplesPage,
});
