import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Contact & Store Location | homemart4u Mulbagal",
  description:
    "Get in touch with homemart4u in Mulbagal. Contact us by phone (+91 90355 26638), email (support.homemart4u@gmail.com), or visit our hub at Srinivaspur Road, Mulbagal 563131.",
};

export default function ContactLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
