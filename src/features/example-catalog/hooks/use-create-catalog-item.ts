import { useMutation, useQueryClient } from "@tanstack/react-query";
import { createCatalogItem } from "../api/create-catalog-item.api";
import { catalogQueryOptions } from "./use-catalog-query";

export function useCreateCatalogItem() {
	const queryClient = useQueryClient();
	return useMutation({
		mutationFn: createCatalogItem,
		// The response is the created item, so the cache is updated from it. The
		// demo has no persistence; with a real backend, also invalidate the list
		// when the server may change more than the returned item.
		onSuccess: (item) => {
			queryClient.setQueryData(catalogQueryOptions.queryKey, (items) =>
				items ? [...items, item] : items,
			);
		},
	});
}
