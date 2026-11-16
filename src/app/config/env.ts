import { z } from "zod";

const MOCK_ONLY_API_URL = "https://example.invalid";

// An unset build argument reaches Vite as an empty string.
const emptyToUndefined = (value: unknown) => (value === "" ? undefined : value);

export const environmentSchema = z
	.object({
		DEV: z.boolean(),
		VITE_API_URL: z.preprocess(emptyToUndefined, z.url().optional()),
		VITE_ENABLE_MOCK: z.preprocess(
			emptyToUndefined,
			z.enum(["true", "false"]).optional(),
		),
	})
	.transform((raw) => ({
		VITE_API_URL: raw.VITE_API_URL,
		// Mocks are a development default; a production build must opt in explicitly.
		VITE_ENABLE_MOCK: raw.VITE_ENABLE_MOCK
			? raw.VITE_ENABLE_MOCK === "true"
			: raw.DEV,
	}))
	.refine((value) => value.VITE_ENABLE_MOCK || value.VITE_API_URL, {
		path: ["VITE_API_URL"],
		error:
			"VITE_API_URL is required when mocks are disabled. Production builds disable mocks unless VITE_ENABLE_MOCK=true is set.",
	})
	.transform((value) => ({
		...value,
		VITE_API_URL: value.VITE_API_URL ?? MOCK_ONLY_API_URL,
	}));

// Vite exposes these values publicly in the browser bundle.
export const env = environmentSchema.parse(import.meta.env);
