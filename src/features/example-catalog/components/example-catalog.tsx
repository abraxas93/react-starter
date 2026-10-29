import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { useCatalogQuery } from "../hooks/use-catalog-query";

export function ExampleCatalog({ search }: { search: string }) {
	const query = useCatalogQuery();
	if (query.isPending) return <output>Loading examples…</output>;
	if (query.isError && !query.data)
		return (
			<div role="alert" className="space-y-3">
				<p>Could not load the examples. Please try again.</p>
				<Button onClick={() => void query.refetch()}>Retry</Button>
			</div>
		);
	const term = search.trim().toLowerCase();
	const items = (query.data ?? []).filter((item) =>
		`${item.title} ${item.description}`.toLowerCase().includes(term),
	);
	return (
		<section aria-label="Catalog results" className="space-y-4">
			<div className="flex flex-wrap items-center justify-between gap-3">
				<output className="text-sm text-muted-foreground">
					{items.length} {items.length === 1 ? "example" : "examples"}
					{query.isFetching ? " · Refreshing…" : ""}
				</output>
				<Button
					variant="outline"
					disabled={query.isFetching}
					onClick={() => void query.refetch()}
				>
					Refresh
				</Button>
			</div>
			{query.isError && (
				<p role="alert">Refresh failed. Showing the last loaded examples.</p>
			)}
			{items.length === 0 ? (
				<p className="rounded-xl border border-dashed p-8 text-center text-muted-foreground">
					No examples match your search.
				</p>
			) : (
				<ul className="grid gap-4 sm:grid-cols-3">
					{items.map((item) => (
						<li key={item.id}>
							<Card className="h-full">
								<CardHeader>
									<h2 className="font-semibold">{item.title}</h2>
								</CardHeader>
								<CardContent className="text-muted-foreground">
									{item.description}
								</CardContent>
							</Card>
						</li>
					))}
				</ul>
			)}
		</section>
	);
}
