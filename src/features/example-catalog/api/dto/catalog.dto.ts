import { z } from "zod";

// Demonstration contract only; replace these schemas with your backend's contract.
export const catalogItemSchema = z.object({
	id: z.string(),
	title: z.string(),
	description: z.string(),
});
export const catalogResponseSchema = z.object({
	items: z.array(catalogItemSchema),
});
export const createCatalogItemRequestSchema = catalogItemSchema.omit({
	id: true,
});
// The parsed item is deliberately also this feature's application model.
export type CatalogItem = z.output<typeof catalogItemSchema>;
export type CreateCatalogItemRequest = z.input<
	typeof createCatalogItemRequestSchema
>;
