import { getRequestHeader } from "@tanstack/react-start/server";
import { pppCoupons } from "@/data/pppCoupons";

const COUNTRY_HEADER_KEY = "x-user-country";

const PLATFORM_COUNTRY_HEADERS = [
  COUNTRY_HEADER_KEY,
  "x-vercel-ip-country", // Vercel
  "cf-ipcountry", // Cloudflare
];

export function setUserCountryHeader(
  headers: Headers,
  country: string | undefined,
) {
  if (country == null) {
    headers.delete(COUNTRY_HEADER_KEY);
  } else {
    headers.set(COUNTRY_HEADER_KEY, country);
  }
}

async function getUserCountry() {
  // Iterate through common headers to find a country code
  for (const headerKey of PLATFORM_COUNTRY_HEADERS) {
    const country = getRequestHeader(headerKey);
    if (country) {
      return country.toUpperCase();
    }
  }
  return process.env.NODE_ENV === "development" ? "IN" : undefined;
}

export async function getUserCoupon() {
  const country = await getUserCountry();
  if (country == null) return;

  const coupon = pppCoupons.find((coupon) =>
    coupon.countryCodes.includes(country),
  );

  if (coupon == null) return;

  return {
    couponId: coupon.couponId,
    discountPercentage: coupon.discountPercentage,
  };
}
