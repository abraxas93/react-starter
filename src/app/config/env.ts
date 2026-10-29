import { z } from "zod";

const environmentSchema = z.object({
	VITE_API_URL: z.url().default("https://example.invalid"),
	VITE_ENABLE_MOCK: z
		.enum(["true", "false"])
		.default("true")
		.transform((value) => value === "true"),
});

// Vite exposes these values publicly in the browser bundle.
export const env = environmentSchema.parse(import.meta.env);
