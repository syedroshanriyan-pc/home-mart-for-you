import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Your Shopping Bag | homemart4u Mulbagal",
  description: "Review your fresh meat cuts, daily grocery essentials, and estimated delivery fee in Mulbagal.",
};

export default function CartLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
