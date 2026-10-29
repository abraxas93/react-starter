import { Link } from "@tanstack/react-router";
import { useTheme } from "next-themes";
import type { ReactNode } from "react";
import { Button } from "@/components/ui/button";

export function ApplicationShell({ children }: { children: ReactNode }) {
	const { theme, setTheme } = useTheme();
	return (
		<div className="min-h-dvh bg-background">
			<a
				href="#main-content"
				className="sr-only focus:not-sr-only focus:absolute focus:z-10 focus:bg-background focus:p-4"
			>
				Skip to content
			</a>
			<header className="border-b bg-card">
				<div className="mx-auto flex max-w-5xl flex-wrap items-center justify-between gap-4 px-6 py-5">
					<Link to="/" className="font-semibold tracking-tight">
						React starter
					</Link>
					<nav aria-label="Main navigation" className="flex items-center gap-2">
						<Button asChild variant="ghost">
							<Link
								to="/"
								activeProps={{ className: "bg-accent" }}
								activeOptions={{ exact: true }}
							>
								Overview
							</Link>
						</Button>
						<Button asChild variant="ghost">
							<Link
								to="/examples"
								search={{ q: "" }}
								activeProps={{ className: "bg-accent" }}
							>
								Example
							</Link>
						</Button>
					</nav>
					<fieldset aria-label="Color theme" className="flex gap-1">
						{(["light", "dark", "system"] as const).map((value) => (
							<Button
								key={value}
								variant="outline"
								size="sm"
								aria-pressed={theme === value}
								onClick={() => setTheme(value)}
							>
								{value.charAt(0).toUpperCase() + value.slice(1)}
							</Button>
						))}
					</fieldset>
				</div>
			</header>
			<main
				id="main-content"
				tabIndex={-1}
				className="mx-auto max-w-5xl px-6 py-12"
			>
				{children}
			</main>
			<footer className="mx-auto max-w-5xl px-6 pb-8 text-sm text-muted-foreground">
				A small starting point. Make it your own.
			</footer>
		</div>
	);
}
