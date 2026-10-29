import { z } from "zod";
import type { ApiMethod } from "@/api/types.ts";

export class NonRetryableError extends Error {}

export class ApiError extends Error {
	constructor(
		public readonly status: number,
		public readonly statusText: string,
		public readonly data: unknown,
		public readonly headers: Headers,
	) {
		super(`HTTP ${status}: ${statusText}`);
		this.name = "ApiError";
	}
}

export class ApiResponseValidationError extends NonRetryableError {
	readonly issues: z.core.$ZodIssue[];

	constructor(
		public readonly method: ApiMethod,
		public readonly path: string,
		validationError: z.ZodError,
	) {
		super(
			`[${method}] (${path}): Response validation failed\n${z.prettifyError(validationError)}`,
			{ cause: validationError },
		);
		this.name = "ApiResponseValidationError";
		this.issues = validationError.issues;
	}
}
