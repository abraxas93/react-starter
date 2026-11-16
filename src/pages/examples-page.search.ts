import { z } from "zod";

export const examplesSearchDefaults = { q: "" };
export const examplesSearchSchema = z.object({
	q: z.string().max(100).default(examplesSearchDefaults.q).catch(""),
});
