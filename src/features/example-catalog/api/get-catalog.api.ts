import { apiClient } from "#/app/di/api-client";
import { catalogResponseSchema } from "./dto/catalog.dto";
import { catalogMock } from "./dto/catalog.mock";

export async function getCatalog(signal?: AbortSignal) {
	// This illustrative endpoint has no supplied backend. Mocking is enabled by default.
	const response = await apiClient
		.get("/examples/catalog")
		.signal(signal)
		.response(catalogResponseSchema)
		.mock(catalogMock);
	return response.items;
}
