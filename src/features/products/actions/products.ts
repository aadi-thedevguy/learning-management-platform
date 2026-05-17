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
		try {
			if (!canCreateProducts(await getCurrentUser())) {
				return {
					error: true,
					message: "There was an error creating your product",
				};
			}

			const product = await insertProduct(data);

			return {
				error: false,
				message: "Successfully created your product",
				data: { productId: product.id },
			};
		} catch (error) {
			console.error("Failed to add product:", error);
			if (error instanceof Error) {
				return {
					error: true,
					message: error.message,
					data: {},
				};
			}
			return {
				error: true,
				message: "Failed to add product",
				data: {},
			};
		}
	});

export const updateProductFn = createServerFn({ method: "POST" })
	.inputValidator(z.object({ id: z.string(), values: productSchema }))
	.handler(async ({ data }) => {
		try {
			if (!canUpdateProducts(await getCurrentUser())) {
				return {
					error: true,
					message: "There was an error updating your product",
				};
			}

			await updateProductDb(data.id, data.values);

			return {
				error: false,
				message: "Successfully updated your product",
				data: {},
			};
		} catch (error) {
			console.error("Failed to update product:", error);
			if (error instanceof Error) {
				return {
					error: true,
					message: error.message,
					data: {},
				};
			}
			return {
				error: true,
				message: "Failed to update product",
				data: {},
			};
		}
	});

export const deleteProductFn = createServerFn({ method: "POST" })
	.inputValidator(z.object({ id: z.string() }))
	.handler(async ({ data }) => {
		try {
			if (!canDeleteProducts(await getCurrentUser())) {
				return { error: true, message: "Error deleting your product" };
			}

			await deleteProductDb(data.id);

			return { error: false, message: "Successfully deleted your product" };
		} catch (error) {
			console.error("Failed to delete product:", error);
			if (error instanceof Error) {
				return {
					error: true,
					message: error.message,
				};
			}
			return {
				error: true,
				message: "Failed to delete product",
			};
		}
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
