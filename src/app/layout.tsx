import type { Metadata } from "next";
import "./globals.css";
import { AuthProvider } from "@/context/AuthContext";
import { CartProvider } from "@/context/CartContext";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";

export const metadata: Metadata = {
  title: "Fresh Chicken | Premium Online Chicken & Meat Delivery in Mulbagal",
  description:
    "Order 100% farm fresh chicken online in Mulbagal. Free delivery for first 3km, ~20-minute delivery target, custom curry/biryani cuts, and COD available.",
  keywords: [
    "Fresh Chicken Mulbagal",
    "Chicken Delivery Mulbagal",
    "Fresh Meat Mulbagal",
    "Buy Chicken Online Mulbagal",
    "Farm Fresh Chicken Karnataka",
    "Curry Cut Chicken Mulbagal",
  ],
  metadataBase: new URL(process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"),
  openGraph: {
    title: "Fresh Chicken Mulbagal | Farm Fresh Tender Cuts Delivered",
    description: "Premium fresh chicken delivered to your doorstep in Mulbagal in ~20 minutes. Free delivery up to 3 km.",
    type: "website",
    locale: "en_IN",
    siteName: "Fresh Chicken",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const structuredData = {
    "@context": "https://schema.org",
    "@type": "ButcherShop",
    name: "Fresh Chicken",
    description:
      "Premium fresh tender chicken, customizable cuts, farm eggs, and express home delivery in Mulbagal.",
    address: {
      "@type": "PostalAddress",
      streetAddress: "Main Bazaar Road, Near Clock Tower",
      addressLocality: "Mulbagal",
      addressRegion: "Karnataka",
      postalCode: "563131",
      addressCountry: "IN",
    },
    geo: {
      "@type": "GeoCoordinates",
      latitude: 13.1645,
      longitude: 78.3952,
    },
    telephone: "+919845012345",
    openingHours: "Mo-Su 06:30-21:00",
    priceRange: "₹₹",
  };

  return (
    <html lang="en">
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
        />
      </head>
      <body className="min-h-screen flex flex-col bg-cream-50 text-charcoal-600 antialiased">
        <AuthProvider>
          <CartProvider>
            <Navbar />
            <main className="flex-1">{children}</main>
            <Footer />
          </CartProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
