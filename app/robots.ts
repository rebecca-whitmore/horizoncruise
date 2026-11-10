import type { MetadataRoute } from "next";
import { isPublicSiteIndexable, publicSiteUrl } from "@/lib/wordpress";

export default function robots(): MetadataRoute.Robots {
  const siteUrl = publicSiteUrl();

  if (!isPublicSiteIndexable()) {
    return { rules: { userAgent: "*", disallow: "/" } };
  }

  return {
    rules: { userAgent: "*", allow: "/" },
    sitemap: `${siteUrl}/sitemap.xml`,
    host: siteUrl,
  };
}
