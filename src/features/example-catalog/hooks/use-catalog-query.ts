import { queryOptions, useQuery } from "@tanstack/react-query";
import { getCatalog } from "../api/get-catalog.api";

export const catalogQueryOptions = queryOptions({
	queryKey: ["example-catalog"],
	queryFn: ({ signal }) => getCatalog(signal),
	staleTime: 60_000,
});

export function useCatalogQuery() {
	return useQuery(catalogQueryOptions);
}
