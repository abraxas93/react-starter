import { afterEach, describe, expect, it, vi } from "vitest";
import { z } from "zod";
import { ApiClient } from "./client";

afterEach(() => vi.unstubAllGlobals());

describe("HTTP transport", () => {
	it("serializes JSON and validates the returned value", async () => {
		const fetchMock = vi.fn().mockResolvedValue(
			new Response(JSON.stringify({ id: "1", extra: true }), {
				headers: { "content-type": "application/json" },
			}),
		);
		vi.stubGlobal("fetch", fetchMock);
		const result = await new ApiClient("https://example.invalid/api/")
			.post("/items")
			.body({ title: "Example" })
			.response(z.object({ id: z.string() }));
		expect(result).toEqual({ id: "1" });
		const request: Request = fetchMock.mock.calls[0][0];
		expect(request.url).toBe("https://example.invalid/api/items");
		expect(request.method).toBe("POST");
		expect(request.headers.get("content-type")).toBe("application/json");
		expect(await request.json()).toEqual({ title: "Example" });
	});
	it("normalizes authentication failures without an implicit refresh call", async () => {
		const fetchMock = vi
			.fn()
			.mockResolvedValue(
				new Response(null, { status: 401, statusText: "Unauthorized" }),
			);
		vi.stubGlobal("fetch", fetchMock);
		await expect(
			Promise.resolve(
				new ApiClient("https://example.invalid")
					.get("/items")
					.response(z.unknown()),
			),
		).rejects.toMatchObject({ name: "ApiError", status: 401 });
		expect(fetchMock).toHaveBeenCalledTimes(1);
	});
	it("supports an empty successful response", async () => {
		vi.stubGlobal(
			"fetch",
			vi.fn().mockResolvedValue(new Response(null, { status: 204 })),
		);
		await expect(
			Promise.resolve(
				new ApiClient("https://example.invalid")
					.delete("/items/1")
					.response(z.undefined()),
			),
		).resolves.toBeUndefined();
	});
	it("validates and transforms mocks without fetching, including empty responses", async () => {
		const fetchMock = vi.fn();
		vi.stubGlobal("fetch", fetchMock);
		const client = new ApiClient("https://example.invalid", {
			mockEnabled: true,
		});
		expect(
			await client
				.get("/value")
				.response(z.string().transform((value) => value.length))
				.mock("hello"),
		).toBe(5);
		expect(
			await client.delete("/value").response(z.undefined()).mock(undefined),
		).toBeUndefined();
		await expect(
			Promise.resolve(
				client.get("/value").response(z.string().min(3)).mock("x"),
			),
		).rejects.toMatchObject({ name: "ApiResponseValidationError" });
		expect(fetchMock).not.toHaveBeenCalled();
	});
	it("uses the real transport when mocks are disabled", async () => {
		const fetchMock = vi.fn().mockResolvedValue(
			new Response('"real"', {
				headers: { "content-type": "application/json" },
			}),
		);
		vi.stubGlobal("fetch", fetchMock);
		expect(
			await new ApiClient("https://example.invalid")
				.get("/value")
				.response(z.string())
				.mock("demo"),
		).toBe("real");
		expect(fetchMock).toHaveBeenCalledTimes(1);
	});
});
