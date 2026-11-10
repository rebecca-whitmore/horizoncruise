import type { MetadataRoute } from "next";
import { getSitemapPosts, publicSiteUrl } from "@/lib/wordpress";

export const revalidate = 60;

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const siteUrl = publicSiteUrl();
  const result = await getSitemapPosts();
  const staticPages: MetadataRoute.Sitemap = [
    { url: siteUrl, changeFrequency: "weekly", priority: 1 },
    { url: `${siteUrl}/articles`, changeFrequency: "daily", priority: 0.9 },
  ];

  if (result.status === "error") return staticPages;

  return [
    ...staticPages,
    ...result.data.map((post) => ({
      url: `${siteUrl}/articles/${encodeURIComponent(post.slug)}`,
      lastModified: new Date(post.modified),
      changeFrequency: "weekly" as const,
      priority: 0.8,
    })),
  ];
}
