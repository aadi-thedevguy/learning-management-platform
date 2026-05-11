import { redirect } from "@tanstack/react-router";
import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import {
	deleteProduct as deleteProductDb,
	insertProduct,
	updateProduct as updateProductDb,
} from "@/features/products/db/products";
import { getCurrentUser } from "@/services/clerk";
import {
	canCreateProducts,
	canDeleteProducts,
	canUpdateProducts,
} from "../permissions/products";
import { productSchema } from "../schema/products";

export const createProductFn = createServerFn({ method: "POST" })
	.inputValidator(productSchema)
	.handler(async ({ data }) => {
		if (!canCreateProducts(await getCurrentUser())) {
			return {
				error: true,
				message: "There was an error creating your product",
			};
		}

		await insertProduct(data);

		throw redirect({ to: "/admin/products" });
	});

export const updateProductFn = createServerFn({ method: "POST" })
	.inputValidator(z.object({ id: z.string(), values: productSchema }))
	.handler(async ({ data }) => {
		if (!canUpdateProducts(await getCurrentUser())) {
			return {
				error: true,
				message: "There was an error updating your product",
			};
		}

		await updateProductDb(data.id, data.values);

		throw redirect({ to: "/admin/products" });
	});

export const deleteProductFn = createServerFn({ method: "POST" })
	.inputValidator(z.object({ id: z.string() }))
	.handler(async ({ data }) => {
		if (!canDeleteProducts(await getCurrentUser())) {
			return { error: true, message: "Error deleting your product" };
		}

		await deleteProductDb(data.id);

		return { error: false, message: "Successfully deleted your product" };
	});

export function createProduct(unsafeData: z.infer<typeof productSchema>) {
	return createProductFn({ data: unsafeData });
}

export function updateProduct(
	id: string,
	unsafeData: z.infer<typeof productSchema>,
) {
	return updateProductFn({ data: { id, values: unsafeData } });
}

export function deleteProduct(id: string) {
	return deleteProductFn({ data: { id } });
}
