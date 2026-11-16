import { type FormEvent, useId, useState } from "react";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
	type CatalogItemInput,
	catalogItemInputSchema,
} from "../validation/catalog-item-input.schema";

type FieldErrors = Partial<Record<keyof CatalogItemInput, string>>;

const fields = [
	{ name: "title", label: "Title" },
	{ name: "description", label: "Description" },
] as const;

export function AddCatalogItemForm({
	onSubmit,
	isSubmitting,
	submitError,
}: {
	onSubmit: (values: CatalogItemInput) => void;
	isSubmitting: boolean;
	submitError?: string;
}) {
	const id = useId();
	const [errors, setErrors] = useState<FieldErrors>({});

	function handleSubmit(event: FormEvent<HTMLFormElement>) {
		event.preventDefault();
		const result = catalogItemInputSchema.safeParse(
			Object.fromEntries(new FormData(event.currentTarget)),
		);
		if (!result.success) {
			const { fieldErrors } = z.flattenError(result.error);
			setErrors({
				title: fieldErrors.title?.[0],
				description: fieldErrors.description?.[0],
			});
			return;
		}
		setErrors({});
		onSubmit(result.data);
	}

	return (
		<form
			noValidate
			aria-label="Add an example"
			className="grid gap-4 sm:grid-cols-[1fr_2fr_auto] sm:items-start"
			onSubmit={handleSubmit}
		>
			{fields.map(({ name, label }) => {
				const error = errors[name];
				return (
					<div key={name} className="space-y-2">
						<Label htmlFor={`${id}-${name}`}>{label}</Label>
						<Input
							id={`${id}-${name}`}
							name={name}
							aria-invalid={error ? true : undefined}
							aria-describedby={error ? `${id}-${name}-error` : undefined}
						/>
						{error && (
							<p
								id={`${id}-${name}-error`}
								className="text-sm text-destructive"
							>
								{error}
							</p>
						)}
					</div>
				);
			})}
			<Button type="submit" disabled={isSubmitting} className="sm:mt-5.5">
				{isSubmitting ? "Adding…" : "Add example"}
			</Button>
			{submitError && (
				<p role="alert" className="text-sm text-destructive sm:col-span-3">
					{submitError}
				</p>
			)}
		</form>
	);
}
