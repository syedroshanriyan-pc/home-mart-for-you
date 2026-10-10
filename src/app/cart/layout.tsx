import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Your Shopping Bag | Fresh Chicken Mulbagal",
  description: "Review your fresh meat cuts, custom preparations, and estimated delivery fee in Mulbagal.",
};

export default function CartLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
