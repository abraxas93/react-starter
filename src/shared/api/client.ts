import { ApiError } from "@/api/error";
import { ApiRequest } from "@/api/request";
import type { ApiMethod } from "@/api/types";

export class ApiClient {
	constructor(
		public readonly baseUrl: string,
		private readonly options: { mockEnabled?: boolean } = {},
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
			async (request) => {
				const response = await fetch(request);
				const text = response.status === 204 ? "" : await response.text();
				const data: unknown =
					text &&
					response.headers.get("content-type")?.includes("application/json")
						? JSON.parse(text)
						: text || undefined;
				if (!response.ok) {
					throw new ApiError(
						response.status,
						response.statusText,
						data,
						response.headers,
					);
				}
				return data;
			},
			this.options.mockEnabled,
		);
	}
}
