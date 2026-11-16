import { apiClient } from "#/app/di/api-client";
import {
	type CreateCatalogItemRequest,
	catalogItemSchema,
} from "./dto/catalog.dto";
import { createCatalogItemMock } from "./dto/create-catalog-item.mock";

export function createCatalogItem(request: CreateCatalogItemRequest) {
	return apiClient
		.post("/examples/catalog")
		.body(request)
		.response(catalogItemSchema)
		.mock(createCatalogItemMock(request))
		.send();
}
