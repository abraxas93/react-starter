import type { ZodType } from "zod";
import { ApiResponseValidationError } from "@/api/error";
import type {
	ApiMethod,
	ApiQuery,
	ApiRequestBody,
	ApiTransport,
} from "@/api/types";

/** Builds a request. Call `.response(schema)` to make it sendable. */
export class ApiRequest {
	readonly #transport: ApiTransport;
	readonly #mockEnabled: boolean;
	readonly #headers = new Headers();
	#body?: ApiRequestBody;
	#signal?: AbortSignal;

	constructor(
		public readonly method: ApiMethod,
		public readonly url: URL,
		transport: ApiTransport,
		mockEnabled = false,
	) {
		this.#transport = transport;
		this.#mockEnabled = mockEnabled;
	}

	query(data: ApiQuery): this {
		for (const [key, value] of Object.entries(data)) {
			if (value === undefined) continue;
			this.url.searchParams.delete(key);
			for (const item of Array.isArray(value) ? value : [value]) {
				this.url.searchParams.append(key, String(item));
			}
		}
		return this;
	}

	headers(headers: Record<string, string>): this {
		for (const [name, value] of Object.entries(headers)) {
			this.#headers.set(name, value);
		}
		return this;
	}

	body(body: ApiRequestBody): this {
		this.#body = body;
		return this;
	}

	signal(signal: AbortSignal | undefined): this {
		this.#signal = signal;
		return this;
	}

	response<Output, Input>(
		schema: ZodType<Output, Input>,
	): ValidatedApiRequest<Output, Input> {
		return new ValidatedApiRequest(
			this.method,
			this.url.pathname,
			schema,
			() => this.#transport(this.#toRequest()),
			this.#mockEnabled,
		);
	}

	#toRequest(): Request {
		const headers = new Headers(this.#headers);
		let body: FormData | string | undefined;
		if (this.#body instanceof FormData) {
			body = this.#body;
		} else if (this.#body !== undefined) {
			body = JSON.stringify(this.#body);
			headers.set("Content-Type", "application/json");
		}
		return new Request(this.url, {
			method: this.method,
			headers,
			body,
			signal: this.#signal,
		});
	}
}

/** A request with a response contract. Nothing is sent until `.send()`. */
export class ValidatedApiRequest<Output, Input> {
	readonly #schema: ZodType<Output, Input>;
	readonly #execute: () => Promise<unknown>;
	readonly #mockEnabled: boolean;
	#mock?: { data: Input };

	constructor(
		public readonly method: ApiMethod,
		public readonly path: string,
		schema: ZodType<Output, Input>,
		execute: () => Promise<unknown>,
		mockEnabled: boolean,
	) {
		this.#schema = schema;
		this.#execute = execute;
		this.#mockEnabled = mockEnabled;
	}

	/** Raw backend payload used instead of the network when mocks are enabled. */
	mock(data: Input): this {
		this.#mock = { data };
		return this;
	}

	/** Sends the request (one network call per invocation) and validates the response. */
	async send(): Promise<Output> {
		const data =
			this.#mock && this.#mockEnabled ? this.#mock.data : await this.#execute();
		const result = await this.#schema.safeParseAsync(data);
		if (!result.success) {
			throw new ApiResponseValidationError(
				this.method,
				this.path,
				result.error,
			);
		}
		return result.data;
	}
}
