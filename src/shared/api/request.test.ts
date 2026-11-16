import { describe, expect, it } from "vitest";
import { z } from "zod";
import { ApiRequest } from "@/api/request";

describe("ApiRequest response validation", () => {
	it("throws a contextual validation error", async () => {
		const request = new ApiRequest(
			"GET",
			new URL("https://api.example.com/v1/items"),
			async () => ({ data: { items: "not-an-array" } }),
		).response(
			z.object({
				data: z.object({ items: z.array(z.object({ id: z.string() })) }),
			}),
		);

		await expect(request.send()).rejects.toMatchObject({
			name: "ApiResponseValidationError",
			method: "GET",
			path: "/v1/items",
			issues: [
				expect.objectContaining({
					path: ["data", "items"],
				}),
			],
		});
	});

	it("passes an abort signal to the request", async () => {
		const abortController = new AbortController();
		let receivedRequest: Request | undefined;
		await new ApiRequest(
			"GET",
			new URL("https://api.example.com/v1/items"),
			async (input) => {
				receivedRequest = input;
				return { data: [] };
			},
		)
			.signal(abortController.signal)
			.response(z.object({ data: z.array(z.string()) }))
			.send();

		expect(receivedRequest?.signal.aborted).toBe(false);
		abortController.abort();
		expect(receivedRequest?.signal.aborted).toBe(true);
	});

	it("sends nothing until send() and once per call", async () => {
		let calls = 0;
		const request = new ApiRequest(
			"GET",
			new URL("https://api.example.com/v1/items"),
			async () => {
				calls += 1;
				return "ok";
			},
		).response(z.string());

		expect(calls).toBe(0);
		await request.send();
		await request.send();
		expect(calls).toBe(2);
	});
});
