export type ApiMethod = "GET" | "POST" | "PUT" | "PATCH" | "DELETE";
export type ApiRequestBody = Record<string, unknown> | FormData;
export type ApiRequestFetch = (request: Request) => Promise<unknown>;
