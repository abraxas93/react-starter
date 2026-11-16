import { useState } from "react";
import { useCreateCatalogItem } from "../hooks/use-create-catalog-item";
import { AddCatalogItemForm } from "./add-catalog-item-form";

export function AddCatalogItem() {
	const mutation = useCreateCatalogItem();
	// Remounting the uncontrolled form clears it after a successful submission.
	const [formKey, setFormKey] = useState(0);
	return (
		<AddCatalogItemForm
			key={formKey}
			isSubmitting={mutation.isPending}
			submitError={
				mutation.isError
					? "Could not add the example. Please try again."
					: undefined
			}
			onSubmit={(values) =>
				mutation.mutate(values, {
					onSuccess: () => setFormKey((key) => key + 1),
				})
			}
		/>
	);
}
