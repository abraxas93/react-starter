import { ApiError, NonRetryableError } from "@/api/error.ts";

const DEFAULT_QUERY_RETRY_COUNT = 3;

export function shouldRetryQuery(failureCount: number, error: Error): boolean {
	return (
		!(error instanceof NonRetryableError) &&
		!(error instanceof ApiError && error.status === 404) &&
		failureCount < DEFAULT_QUERY_RETRY_COUNT
	);
}
