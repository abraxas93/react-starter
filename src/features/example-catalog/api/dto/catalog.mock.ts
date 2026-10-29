import type { z } from "zod";
import type { catalogResponseSchema } from "./catalog.dto";

export const catalogMock = {
	items: [
		{
			id: "routing",
			title: "File-based routing",
			description:
				"Typed navigation and validated URL search parameters with TanStack Router.",
		},
		{
			id: "data",
			title: "Validated data",
			description:
				"TanStack Query manages server state, while Zod checks responses at the API boundary.",
		},
		{
			id: "components",
			title: "Accessible components",
			description:
				"Shared shadcn/ui primitives, Radix composition, and semantic Tailwind theme tokens.",
		},
	],
} satisfies z.input<typeof catalogResponseSchema>;
