export type ApiMethod = "GET" | "POST" | "PUT" | "PATCH" | "DELETE";
export type ApiQueryValue = string | number | boolean;
export type ApiQuery = Record<
	string,
	ApiQueryValue | readonly ApiQueryValue[] | undefined
>;
export type ApiRequestBody =
	| FormData
	| Record<string, unknown>
	| readonly unknown[];
export type ApiTransport = (request: Request) => Promise<unknown>;
