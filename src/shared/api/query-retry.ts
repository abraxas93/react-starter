import { ApiError, NonRetryableError } from "@/api/error.ts";

const DEFAULT_QUERY_RETRY_COUNT = 3;
const REQUEST_TIMEOUT = 408;
const TOO_MANY_REQUESTS = 429;

// A client error repeats deterministically, except a timeout or a rate limit.
function isDeterministicClientError(error: Error): boolean {
	return (
		error instanceof ApiError &&
		error.status >= 400 &&
		error.status < 500 &&
		error.status !== REQUEST_TIMEOUT &&
		error.status !== TOO_MANY_REQUESTS
	);
}

export function shouldRetryQuery(failureCount: number, error: Error): boolean {
	return (
		!(error instanceof NonRetryableError) &&
		!isDeterministicClientError(error) &&
		failureCount < DEFAULT_QUERY_RETRY_COUNT
	);
}
