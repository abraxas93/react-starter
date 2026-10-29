import { createFileRoute } from "@tanstack/react-router";
import { ExamplesPage } from "#/pages/examples-page";
import { examplesSearchSchema } from "#/pages/examples-page.search";
export const Route = createFileRoute("/examples")({
	validateSearch: (search) => examplesSearchSchema.parse(search),
	component: ExamplesPage,
});
