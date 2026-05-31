import DodoPayments from "dodopayments";
import { env } from "@/env";
import { getUserCoupon } from "@/lib/userCountryHeader";

export const client = new DodoPayments({
  bearerToken: env.DODOPAYMENTS_API_KEY,
  environment: env.NODE_ENV === "development" ? "test_mode" : "live_mode",
});

export async function getClientSessionSecret(
  product: {
    priceInDollars: number;
    name: string;
    imageUrl: string;
    description: string;
    id: string;
    dodoProductId: string;
  },
  user: { email: string; id: string; name: string },
) {
  const coupon = await getUserCoupon();

  const payment = await client.checkoutSessions.create({
    customer: { name: user.name, email: user.email },
    product_cart: [{ product_id: product.dodoProductId, quantity: 1 }],
    discount_code: coupon?.couponId,
    billing_currency: "USD",
    return_url: `${env.VITE_SERVER_URL}/purchase/after`,
    metadata: {
      productId: product.id,
      userId: user.id,
    },
  });

  if (!payment.checkout_url) throw new Error("Payment link not found");

  return payment.checkout_url;
}
