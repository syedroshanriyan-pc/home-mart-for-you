import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Contact & Store Location | Fresh Chicken Mulbagal",
  description:
    "Get in touch with Fresh Chicken in Mulbagal. Contact us by phone (+91 98450 12345), email, or visit our retail processing hub near Clock Tower, Mulbagal.",
};

export default function ContactLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
