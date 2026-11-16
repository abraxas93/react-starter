import { ApiError } from "@/api/error";
import { ApiRequest } from "@/api/request";
import type { ApiMethod } from "@/api/types";

export interface ApiClientOptions {
	/** Use payloads attached through `.mock(...)` instead of the network. */
	mockEnabled?: boolean;
	/** Fetch credentials mode, e.g. `"include"` for cookie authentication. */
	credentials?: RequestCredentials;
	/** Abort a request that takes longer than this. No timeout by default. */
	timeoutMs?: number;
	/** Headers added to every request, e.g. `Authorization`. Per-request headers win. */
	headers?: () => HeadersInit | Promise<HeadersInit>;
}

async function readBody(response: Response): Promise<unknown> {
	if (response.status === 204) return undefined;
	const text = await response.text();
	if (!text) return undefined;
	if (!response.headers.get("content-type")?.includes("application/json")) {
		return text;
	}
	try {
		return JSON.parse(text);
	} catch {
		// A mislabelled body stays text: error responses keep their status, and
		// successful ones fail response validation instead of being retried.
		return text;
	}
}

export class ApiClient {
	constructor(
		public readonly baseUrl: string,
		private readonly options: ApiClientOptions = {},
	) {}

	get(path: string) {
		return this.request("GET", path);
	}
	post(path: string) {
		return this.request("POST", path);
	}
	put(path: string) {
		return this.request("PUT", path);
	}
	patch(path: string) {
		return this.request("PATCH", path);
	}
	delete(path: string) {
		return this.request("DELETE", path);
	}

	private request(method: ApiMethod, path: string) {
		return new ApiRequest(
			method,
			new URL(`${this.baseUrl.replace(/\/$/, "")}/${path.replace(/^\//, "")}`),
			(request) => this.send(request),
			this.options.mockEnabled,
		);
	}

	private async send(request: Request): Promise<unknown> {
		const { credentials, timeoutMs } = this.options;
		const headers = new Headers(await this.options.headers?.());
		request.headers.forEach((value, name) => {
			headers.set(name, value);
		});
		const signal =
			timeoutMs === undefined
				? request.signal
				: AbortSignal.any([request.signal, AbortSignal.timeout(timeoutMs)]);
		const response = await fetch(
			new Request(request, { headers, credentials, signal }),
		);
		const data = await readBody(response);
		if (!response.ok) {
			throw new ApiError(
				response.status,
				response.statusText,
				data,
				response.headers,
			);
		}
		return data;
	}
}
