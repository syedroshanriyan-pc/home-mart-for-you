import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Express Checkout | homemart4u Mulbagal",
  description: "Complete your grocery and meat order with Cash on Delivery or automated UPI. Fast delivery within ~20 minutes across Mulbagal.",
};

export default function CheckoutLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
