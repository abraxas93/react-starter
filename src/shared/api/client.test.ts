import { afterEach, describe, expect, it, vi } from "vitest";
import { z } from "zod";
import { ApiClient } from "./client";

afterEach(() => {
	vi.unstubAllGlobals();
	vi.useRealTimers();
});

function stubFetch(...responses: Response[]) {
	const fetchMock = vi.fn<(request: Request) => Promise<Response>>();
	for (const response of responses) fetchMock.mockResolvedValueOnce(response);
	vi.stubGlobal("fetch", fetchMock);
	return fetchMock;
}

function sentRequest(fetchMock: ReturnType<typeof stubFetch>): Request {
	const request = fetchMock.mock.calls[0]?.[0];
	if (!request) throw new Error("Expected a request to be sent");
	return request;
}

const json = (value: unknown, init?: ResponseInit) =>
	new Response(JSON.stringify(value), {
		...init,
		headers: { "content-type": "application/json" },
	});

describe("HTTP transport", () => {
	it("serializes JSON and validates the returned value", async () => {
		const fetchMock = stubFetch(json({ id: "1", extra: true }));
		const result = await new ApiClient("https://example.invalid/api/")
			.post("/items")
			.body({ title: "Example" })
			.response(z.object({ id: z.string() }))
			.send();
		expect(result).toEqual({ id: "1" });
		const request = sentRequest(fetchMock);
		expect(request.url).toBe("https://example.invalid/api/items");
		expect(request.method).toBe("POST");
		expect(request.headers.get("content-type")).toBe("application/json");
		expect(await request.json()).toEqual({ title: "Example" });
	});
	it("applies client headers and credentials, letting request headers win", async () => {
		const fetchMock = stubFetch(json("ok"));
		await new ApiClient("https://example.invalid", {
			credentials: "include",
			headers: async () => ({ Authorization: "Bearer test", "X-Trace": "a" }),
		})
			.get("/items")
			.headers({ "X-Trace": "b" })
			.response(z.string())
			.send();
		const request = sentRequest(fetchMock);
		expect(request.credentials).toBe("include");
		expect(request.headers.get("authorization")).toBe("Bearer test");
		expect(request.headers.get("x-trace")).toBe("b");
	});
	it("serializes query values and skips undefined ones", async () => {
		const fetchMock = stubFetch(json("ok"));
		await new ApiClient("https://example.invalid")
			.get("/items")
			.query({ tag: ["a", "b"], page: 2, archived: false, cursor: undefined })
			.response(z.string())
			.send();
		expect(sentRequest(fetchMock).url).toBe(
			"https://example.invalid/items?tag=a&tag=b&page=2&archived=false",
		);
	});
	it("aborts a request that exceeds the timeout", async () => {
		vi.stubGlobal(
			"fetch",
			vi.fn(
				(request: Request) =>
					new Promise((_, reject) => {
						request.signal.addEventListener("abort", () =>
							reject(request.signal.reason),
						);
					}),
			),
		);
		await expect(
			new ApiClient("https://example.invalid", { timeoutMs: 10 })
				.get("/slow")
				.response(z.unknown())
				.send(),
		).rejects.toMatchObject({ name: "TimeoutError" });
	});
	it("normalizes authentication failures without an implicit refresh call", async () => {
		const fetchMock = stubFetch(
			new Response(null, { status: 401, statusText: "Unauthorized" }),
		);
		await expect(
			new ApiClient("https://example.invalid")
				.get("/items")
				.response(z.unknown())
				.send(),
		).rejects.toMatchObject({ name: "ApiError", status: 401 });
		expect(fetchMock).toHaveBeenCalledTimes(1);
	});
	it("keeps the status of an error whose JSON body is malformed", async () => {
		stubFetch(
			new Response("<html>Bad gateway</html>", {
				status: 502,
				headers: { "content-type": "application/json" },
			}),
		);
		await expect(
			new ApiClient("https://example.invalid")
				.get("/items")
				.response(z.unknown())
				.send(),
		).rejects.toMatchObject({
			name: "ApiError",
			status: 502,
			data: "<html>Bad gateway</html>",
		});
	});
	it("supports an empty successful response", async () => {
		stubFetch(new Response(null, { status: 204 }));
		await expect(
			new ApiClient("https://example.invalid")
				.delete("/items/1")
				.response(z.undefined())
				.send(),
		).resolves.toBeUndefined();
	});
	it("validates and transforms mocks without fetching, including empty responses", async () => {
		const fetchMock = stubFetch();
		const client = new ApiClient("https://example.invalid", {
			mockEnabled: true,
		});
		expect(
			await client
				.get("/value")
				.response(z.string().transform((value) => value.length))
				.mock("hello")
				.send(),
		).toBe(5);
		expect(
			await client
				.delete("/value")
				.response(z.undefined())
				.mock(undefined)
				.send(),
		).toBeUndefined();
		await expect(
			client.get("/value").response(z.string().min(3)).mock("x").send(),
		).rejects.toMatchObject({ name: "ApiResponseValidationError" });
		expect(fetchMock).not.toHaveBeenCalled();
	});
	it("uses the real transport when mocks are disabled", async () => {
		const fetchMock = stubFetch(json("real"));
		expect(
			await new ApiClient("https://example.invalid")
				.get("/value")
				.response(z.string())
				.mock("demo")
				.send(),
		).toBe("real");
		expect(fetchMock).toHaveBeenCalledTimes(1);
	});
});
