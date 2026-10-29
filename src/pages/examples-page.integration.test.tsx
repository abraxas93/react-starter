// @vitest-environment jsdom
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { createMemoryHistory, RouterProvider } from "@tanstack/react-router";
import {
	cleanup,
	fireEvent,
	render,
	screen,
	waitFor,
} from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { createAppRouter } from "#/app/di/router";

const clients: QueryClient[] = [];
beforeEach(() => vi.stubGlobal("scrollTo", vi.fn()));
afterEach(() => {
	cleanup();
	vi.unstubAllGlobals();
	for (const client of clients) client.clear();
	clients.length = 0;
});

async function renderPage(path: string) {
	const client = new QueryClient({
		defaultOptions: { queries: { retry: false } },
	});
	clients.push(client);
	const router = createAppRouter(
		createMemoryHistory({ initialEntries: [path] }),
	);
	await router.load();
	render(
		<QueryClientProvider client={client}>
			<RouterProvider router={router} />
		</QueryClientProvider>,
	);
	return router;
}

describe("starter navigation", () => {
	it("loads mock data, filters through the URL, and shows an empty result", async () => {
		const router = await renderPage("/examples?q=routing");
		expect(
			await screen.findByRole("heading", { name: "File-based routing" }),
		).toBeTruthy();
		expect(
			screen.queryByRole("heading", { name: "Validated data" }),
		).toBeNull();
		fireEvent.change(screen.getByRole("searchbox"), {
			target: { value: "no-matching-example" },
		});
		expect(
			await screen.findByText("No examples match your search."),
		).toBeTruthy();
		await waitFor(() =>
			expect(router.state.location.search).toEqual({
				q: "no-matching-example",
			}),
		);
		fireEvent.change(screen.getByRole("searchbox"), { target: { value: "" } });
		expect(
			await screen.findByRole("heading", { name: "Validated data" }),
		).toBeTruthy();
	});
	it("links the overview to the example", async () => {
		await renderPage("/");
		fireEvent.click(
			await screen.findByRole("link", { name: "Explore the example" }),
		);
		expect(
			await screen.findByRole("heading", { name: "Example catalog" }),
		).toBeTruthy();
	});
	it("provides a way home from an unknown route", async () => {
		await renderPage("/missing");
		expect(
			await screen.findByRole("heading", { name: "Page not found" }),
		).toBeTruthy();
		fireEvent.click(screen.getByRole("link", { name: "Back to home" }));
		expect(
			await screen.findByRole("heading", {
				name: "Your next project starts here.",
			}),
		).toBeTruthy();
	});
});
