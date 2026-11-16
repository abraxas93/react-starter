import { getRouteApi } from "@tanstack/react-router";
import { AddCatalogItem, ExampleCatalog } from "#/features/example-catalog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

const route = getRouteApi("/examples");

export function ExamplesPage() {
	const { q } = route.useSearch();
	const navigate = route.useNavigate();
	return (
		<div className="space-y-8">
			<header className="space-y-3">
				<h1 className="text-3xl font-semibold tracking-tight">
					Example catalog
				</h1>
				<p className="max-w-2xl text-muted-foreground">
					A sample with a shareable search filter, a validated form, and a
					mutation. The included demo data works without a backend, so added
					examples last until the list is refreshed.
				</p>
			</header>
			<div className="max-w-md space-y-2">
				<Label htmlFor="catalog-search">Search examples</Label>
				<Input
					id="catalog-search"
					type="search"
					placeholder="Try routing or data…"
					maxLength={100}
					value={q}
					onChange={(event) =>
						void navigate({
							search: { q: event.target.value },
							replace: true,
							resetScroll: false,
						})
					}
				/>
			</div>
			<ExampleCatalog search={q} />
			<AddCatalogItem />
		</div>
	);
}
