import { env } from "#/app/config/env";
import { ApiClient } from "@/api/client";

// Add authentication centrally here once the backend contract is known, e.g.
// `credentials: "include"` or `headers: () => ({ Authorization: ... })`.
export const apiClient = new ApiClient(env.VITE_API_URL, {
	mockEnabled: env.VITE_ENABLE_MOCK,
	timeoutMs: 30_000,
});
