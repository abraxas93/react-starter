import type { z } from "zod";
import type {
	CreateCatalogItemRequest,
	catalogItemSchema,
} from "./catalog.dto";

// Echoes the request the way a backend would answer a successful create.
export function createCatalogItemMock(request: CreateCatalogItemRequest) {
	return { id: crypto.randomUUID(), ...request } satisfies z.input<
		typeof catalogItemSchema
	>;
}
