import DodoPayments from "dodopayments";
import { env } from "@/env";
import { getUserCoupon } from "@/lib/userCountryHeader";

export const client = new DodoPayments({
	bearerToken: env.DODOPAYMENTS_API_KEY,
	environment: "test_mode",
});

export async function getClientSessionSecret(
	product: {
		priceInDollars: number;
		name: string;
		imageUrl: string;
		description: string;
		id: string;
	},
	user: { email: string; id: string; name: string },
) {
	const coupon = await getUserCoupon();

	const payment = await client.checkoutSessions.create({
		customer: { name: user.name, email: user.email },
		product_cart: [{ product_id: product.name, quantity: 1 }],
		discount_code: coupon?.couponId,
		// payment_link: true,
		return_url: env.VITE_SERVER_URL,
		metadata: {
			productId: product.id,
			userId: user.id,
		},
	});

	if (!payment.checkout_url) throw new Error("Payment link not found");

	return payment.checkout_url;
}
