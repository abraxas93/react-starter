import { env } from "#/app/config/env";
import { ApiClient } from "@/api/client";

export const apiClient = new ApiClient(env.VITE_API_URL, {
	mockEnabled: env.VITE_ENABLE_MOCK,
});
