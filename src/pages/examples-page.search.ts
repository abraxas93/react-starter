import { z } from "zod";
export const examplesSearchSchema = z.object({
	q: z.string().max(100).catch(""),
});
