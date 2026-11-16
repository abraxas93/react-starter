import { z } from "zod";

export const catalogItemInputSchema = z.object({
	title: z
		.string()
		.trim()
		.min(1, "Enter a title.")
		.max(80, "Use at most 80 characters."),
	description: z
		.string()
		.trim()
		.min(1, "Enter a description.")
		.max(200, "Use at most 200 characters."),
});
export type CatalogItemInput = z.output<typeof catalogItemInputSchema>;
