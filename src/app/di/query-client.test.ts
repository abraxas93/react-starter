import { afterEach, describe, expect, it, vi } from "vitest";
import { NonRetryableError } from "@/api/error.ts";
import { createAppQueryClient } from "./query-client.ts";

afterEach(() => {
	vi.restoreAllMocks();
});

describe("createAppQueryClient", () => {
	it("logs query failures", async () => {
		const consoleError = vi
			.spyOn(console, "error")
			.mockImplementation(() => undefined);
		const error = new NonRetryableError("Query failed");
		const queryClient = createAppQueryClient();

		await expect(
			queryClient.fetchQuery({
				queryKey: ["failed-query"],
				queryFn: () => Promise.reject(error),
			}),
		).rejects.toBe(error);

		expect(consoleError).toHaveBeenCalledWith(
			"[TanStack Query] Query failed",
			error,
		);
	});

	it("logs mutation failures", async () => {
		const consoleError = vi
			.spyOn(console, "error")
			.mockImplementation(() => undefined);
		const error = new Error("Mutation failed");
		const queryClient = createAppQueryClient();
		const mutation = queryClient.getMutationCache().build(queryClient, {
			mutationKey: ["failed-mutation"],
			mutationFn: () => Promise.reject(error),
		});

		await expect(mutation.execute(undefined)).rejects.toBe(error);

		expect(consoleError).toHaveBeenCalledWith(
			"[TanStack Query] Mutation failed",
			error,
		);
	});
});
