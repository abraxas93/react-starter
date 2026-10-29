import type { ZodType, z } from "zod";
import { ApiResponseValidationError } from "@/api/error.ts";
import type {
	ApiMethod,
	ApiRequestBody,
	ApiRequestFetch,
} from "@/api/types.ts";

export class ApiRequest<ResponseOutput = unknown, ResponseInput = never>
	implements PromiseLike<ResponseOutput>
{
	readonly #fetch: ApiRequestFetch;

	#body?: ApiRequestBody;

	#responseType!: ZodType;

	#mockData?: ResponseInput;

	#signal?: AbortSignal;

	#hasMock = false;

	constructor(
		public readonly method: ApiMethod,
		public readonly url: URL,
		fetch: ApiRequestFetch,
		private readonly mockEnabled = false,
	) {
		this.#fetch = fetch;
	}

	query(data: Record<string, string | number | (string | number)[]>): this {
		Object.entries(data || {}).forEach(([key, value]) => {
			if (value === undefined) {
				return;
			}

			if (Array.isArray(value)) {
				this.url?.searchParams.delete(key);
				value.forEach((item) => {
					this.url?.searchParams.append(key, String(item));
				});
				return;
			}

			this.url?.searchParams.set(key, String(value));
		});
		return this;
	}

	body(body: ApiRequestBody): this {
		this.#body = body;
		return this;
	}

	response<Schema extends ZodType>(
		schema: Schema,
	): ApiRequest<z.output<Schema>, z.input<Schema>> {
		this.#responseType = schema;
		return this as ApiRequest<z.output<Schema>, z.input<Schema>>;
	}

	mock(data: ResponseInput): this {
		this.#hasMock = true;
		this.#mockData = data;
		return this;
	}

	signal(signal: AbortSignal | undefined): this {
		this.#signal = signal;
		return this;
	}

	// biome-ignore lint/suspicious/noThenProperty: This is promise like ApiRequest
	then<TResult1 = ResponseOutput, TResult2 = never>(
		resolve?:
			| ((value: ResponseOutput) => PromiseLike<TResult1> | TResult1)
			| undefined
			| null,
		reject?:
			| ((reason: unknown) => PromiseLike<TResult2> | TResult2)
			| undefined
			| null,
	): PromiseLike<TResult1 | TResult2> {
		if (!this.#responseType) {
			throw new Error(
				`[${this.method}] (${this.url.pathname}): Response type is not defined. Use .response(ZodType)`,
			);
		}

		const resolveData = (data: unknown) => {
			if (!resolve) {
				return data as TResult1;
			}

			return resolve(data as ResponseOutput);
		};

		const rejectData = (data: unknown) => {
			if (!reject) {
				throw data;
			}

			return reject(data);
		};

		const headers: Record<string, string> = {};

		let body: FormData | string | undefined;

		if (this.#body) {
			if (this.#body instanceof FormData) {
				body = this.#body;
			} else {
				body = JSON.stringify(this.#body);
				headers["Content-Type"] = "application/json";
			}
		}

		const request = new Request(this.url, {
			method: this.method,
			headers,
			body,
			signal: this.#signal,
		});

		return (
			this.#hasMock && this.mockEnabled
				? Promise.resolve(this.#mockData)
				: this.#fetch(request)
		)
			.then(async (responseData) => {
				const result = await this.#responseType.safeParseAsync(responseData);

				if (result.success) {
					return result.data;
				}

				const error = new ApiResponseValidationError(
					this.method,
					this.url.pathname,
					result.error,
				);

				throw error;
			})
			.then(resolveData)
			.catch(rejectData);
	}
}
