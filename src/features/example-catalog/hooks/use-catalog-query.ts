import { useQuery } from "@tanstack/react-query";
import { getCatalog } from "../api/get-catalog.api";

export function useCatalogQuery() {
	return useQuery({
		queryKey: ["example-catalog"],
		queryFn: ({ signal }) => getCatalog(signal),
		staleTime: 60_000,
	});
}
