import type { QueryClient } from "@tanstack/react-query";
import {
	createRootRouteWithContext,
	Link,
	Outlet,
} from "@tanstack/react-router";
import { ApplicationShell } from "#/widgets/application-shell";
import { Button } from "@/components/ui/button";

export const Route = createRootRouteWithContext<{
	queryClient: QueryClient;
}>()({
	component: () => (
		<ApplicationShell>
			<Outlet />
		</ApplicationShell>
	),
	notFoundComponent: () => (
		<section className="space-y-4">
			<h1 className="text-3xl font-semibold">Page not found</h1>
			<p className="text-muted-foreground">
				This address does not match a page.
			</p>
			<Button asChild>
				<Link to="/">Back to home</Link>
			</Button>
		</section>
	),
	// A root error replaces the root component, so the shell is rendered here too.
	errorComponent: ({ reset }) => (
		<ApplicationShell>
			<section className="space-y-4" role="alert">
				<h1 className="text-3xl font-semibold">Something went wrong</h1>
				<p className="text-muted-foreground">Try opening this page again.</p>
				<Button onClick={reset}>Try again</Button>
			</section>
		</ApplicationShell>
	),
});
