import { Link } from "@tanstack/react-router";
import { ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";

export function HomePage() {
	return (
		<div className="space-y-10">
			<section className="max-w-2xl space-y-5">
				<p className="text-sm font-medium text-muted-foreground">
					REACT + TYPESCRIPT
				</p>
				<h1 className="text-4xl font-semibold tracking-tight sm:text-5xl">
					Your next project starts here.
				</h1>
				<p className="text-lg leading-relaxed text-muted-foreground">
					A minimal foundation with routing, validated data, accessible
					components, and light and dark themes already connected.
				</p>
				<Button asChild size="lg">
					<Link to="/examples" search={{ q: "" }}>
						Explore the example <ArrowRight aria-hidden="true" />
					</Link>
				</Button>
			</section>
			<section
				aria-label="Included foundations"
				className="grid gap-4 sm:grid-cols-3"
			>
				<Card>
					<CardHeader>
						<h2 className="font-semibold">Organized by feature</h2>
					</CardHeader>
					<CardContent className="text-muted-foreground">
						Routes handle navigation. Pages compose the screen. Features own
						their behavior.
					</CardContent>
				</Card>
				<Card>
					<CardHeader>
						<h2 className="font-semibold">Ready for real data</h2>
					</CardHeader>
					<CardContent className="text-muted-foreground">
						A small catalog demonstrates TanStack Query, Zod validation, and
						API-boundary mocks.
					</CardContent>
				</Card>
				<Card>
					<CardHeader>
						<h2 className="font-semibold">Easy to replace</h2>
					</CardHeader>
					<CardContent className="text-muted-foreground">
						One example feature, no account setup, and no backend required to
						get started.
					</CardContent>
				</Card>
			</section>
		</div>
	);
}
