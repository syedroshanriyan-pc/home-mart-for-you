import { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";

  return {
    rules: [
      {
        userAgent: "*",
        allow: ["/", "/menu", "/menu/*", "/product/*", "/offers", "/about", "/contact", "/location"],
        disallow: ["/admin", "/admin/*", "/delivery", "/delivery/*", "/api/*", "/account/*", "/checkout"],
      },
    ],
    sitemap: `${baseUrl}/sitemap.xml`,
  };
}
