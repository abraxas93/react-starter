// @vitest-environment jsdom
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { getCatalog } from "../api/get-catalog.api";
import { ExampleCatalog } from "./example-catalog";

vi.mock("../api/get-catalog.api", () => ({ getCatalog: vi.fn() }));
const clients: QueryClient[] = [];
afterEach(() => {
	cleanup();
	for (const client of clients) client.clear();
	clients.length = 0;
	vi.resetAllMocks();
});
function renderCatalog() {
	const client = new QueryClient({
		defaultOptions: { queries: { retry: false } },
	});
	clients.push(client);
	render(
		<QueryClientProvider client={client}>
			<ExampleCatalog search="" />
		</QueryClientProvider>,
	);
}
const items = [
	{ id: "one", title: "Example item", description: "An example description" },
];

describe("catalog query states", () => {
	it("announces a pending request", () => {
		vi.mocked(getCatalog).mockReturnValue(new Promise(() => {}));
		renderCatalog();
		expect(screen.getByRole("status").textContent).toBe("Loading examples…");
	});
	it("shows an actionable error and recovers on retry", async () => {
		vi.mocked(getCatalog)
			.mockRejectedValueOnce(new Error("Private backend details"))
			.mockResolvedValueOnce(items);
		renderCatalog();
		expect((await screen.findByRole("alert")).textContent).not.toContain(
			"Private backend details",
		);
		fireEvent.click(screen.getByRole("button", { name: "Retry" }));
		expect(
			await screen.findByRole("heading", { name: "Example item" }),
		).toBeTruthy();
	});
	it("keeps loaded results visible when a refresh fails", async () => {
		vi.mocked(getCatalog)
			.mockResolvedValueOnce(items)
			.mockRejectedValueOnce(new Error("Offline"));
		renderCatalog();
		await screen.findByRole("heading", { name: "Example item" });
		fireEvent.click(screen.getByRole("button", { name: "Refresh" }));
		expect((await screen.findByRole("alert")).textContent).toContain(
			"Showing the last loaded examples",
		);
		expect(screen.getByRole("heading", { name: "Example item" })).toBeTruthy();
	});
});
