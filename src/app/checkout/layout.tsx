import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Express Checkout | Fresh Chicken Mulbagal",
  description: "Complete your order with Cash on Delivery or UPI. Target delivery within 20 minutes across Mulbagal.",
};

export default function CheckoutLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
