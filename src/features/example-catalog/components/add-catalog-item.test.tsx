import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, describe, expect, it, vi } from "vitest";
import { createCatalogItem } from "../api/create-catalog-item.api";
import { catalogQueryOptions } from "../hooks/use-catalog-query";
import { AddCatalogItem } from "./add-catalog-item";

vi.mock("../api/create-catalog-item.api", () => ({
	createCatalogItem: vi.fn(),
}));
afterEach(() => vi.resetAllMocks());

function renderForm() {
	const client = new QueryClient();
	client.setQueryData(catalogQueryOptions.queryKey, []);
	render(
		<QueryClientProvider client={client}>
			<AddCatalogItem />
		</QueryClientProvider>,
	);
	return client;
}

async function submit(title: string, description: string) {
	const user = userEvent.setup();
	if (title) {
		await user.type(screen.getByRole("textbox", { name: "Title" }), title);
	}
	if (description) {
		await user.type(
			screen.getByRole("textbox", { name: "Description" }),
			description,
		);
	}
	await user.click(screen.getByRole("button", { name: "Add example" }));
}

describe("adding a catalog item", () => {
	it("reports field errors without calling the API", async () => {
		renderForm();
		await submit("", "   ");
		expect(screen.getByRole("textbox", { name: "Title" })).toBeInvalid();
		expect(
			screen.getByRole("textbox", { name: "Description" }),
		).toHaveAccessibleDescription("Enter a description.");
		expect(createCatalogItem).not.toHaveBeenCalled();
	});
	it("submits trimmed values, updates the cache, and clears the form", async () => {
		const created = { id: "new", title: "Forms", description: "Validated" };
		vi.mocked(createCatalogItem).mockResolvedValue(created);
		const client = renderForm();
		await submit(" Forms ", "Validated");
		expect(createCatalogItem).toHaveBeenCalledWith(
			{ title: "Forms", description: "Validated" },
			expect.anything(),
		);
		expect(client.getQueryData(catalogQueryOptions.queryKey)).toEqual([
			created,
		]);
		expect(screen.getByRole("textbox", { name: "Title" })).toHaveValue("");
	});
	it("keeps the entered values and shows a safe message when the request fails", async () => {
		vi.mocked(createCatalogItem).mockRejectedValue(
			new Error("Private backend details"),
		);
		vi.spyOn(console, "error").mockImplementation(() => undefined);
		renderForm();
		await submit("Forms", "Validated");
		expect(await screen.findByRole("alert")).toHaveTextContent(
			"Could not add the example. Please try again.",
		);
		expect(screen.getByRole("textbox", { name: "Title" })).toHaveValue("Forms");
	});
});
