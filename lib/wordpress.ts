import type { Metadata } from "next";

export const REVALIDATE_SECONDS = 60;

type RenderedText = { rendered: string };

type YoastData = {
  title?: string;
  description?: string;
  canonical?: string;
  og_title?: string;
  og_description?: string;
  og_url?: string;
  og_image?: Array<{ url: string }>;
  schema?: Record<string, unknown>;
};

type AioseoData = {
  title?: string | null;
  description?: string | null;
  canonical?: string | null;
  og_title?: string | null;
  og_description?: string | null;
  og_url?: string | null;
  og_image?: string | null;
  twitter_card?: string | null;
  twitter_title?: string | null;
  twitter_description?: string | null;
  twitter_image?: string | null;
  schema?: Record<string, unknown>;
};

export type WordPressPost = {
  id: number;
  slug: string;
  date: string;
  link: string;
  title: RenderedText;
  excerpt: RenderedText;
  content: RenderedText;
  modified: string;
  aioseo_head?: string;
  aioseo_head_json?: AioseoData;
  yoast_head_json?: YoastData;
  _embedded?: {
    "wp:featuredmedia"?: Array<{
      source_url?: string;
      alt_text?: string;
      media_details?: { sizes?: { large?: { source_url?: string } } };
    }>;
  };
};

export type SitemapPost = { slug: string; modified: string };

export type FetchResult<T> =
  | { status: "success"; data: T }
  | { status: "error"; message: string };

function apiUrl(path: string, search = "") {
  const base = process.env.WORDPRESS_API_URL?.replace(/\/$/, "");

  if (!base) {
    throw new Error("WORDPRESS_API_URL is not configured.");
  }

  return `${base}/${path}${search}`;
}

async function request<T>(url: string): Promise<T> {
  const response = await fetch(url, {
    next: { revalidate: REVALIDATE_SECONDS },
    headers: { Accept: "application/json" },
  });

  if (!response.ok) {
    throw new Error(`WordPress returned ${response.status}.`);
  }

  return response.json() as Promise<T>;
}

export async function getPosts(): Promise<FetchResult<WordPressPost[]>> {
  try {
    const posts = await request<WordPressPost[]>(
      apiUrl("posts", "?_embed=wp:featuredmedia&per_page=12"),
    );
    return { status: "success", data: posts };
  } catch (error) {
    console.error("Could not load WordPress posts:", error);
    return { status: "error", message: "Articles are temporarily unavailable." };
  }
}

export async function getPostBySlug(
  slug: string,
): Promise<FetchResult<WordPressPost | null>> {
  try {
    const posts = await request<WordPressPost[]>(
      apiUrl(
        "posts",
        `?slug=${encodeURIComponent(slug)}&_embed=wp:featuredmedia&per_page=1`,
      ),
    );
    return { status: "success", data: posts[0] ?? null };
  } catch (error) {
    console.error(`Could not load WordPress post “${slug}”:`, error);
    return { status: "error", message: "This article is temporarily unavailable." };
  }
}

export async function getSitemapPosts(): Promise<FetchResult<SitemapPost[]>> {
  try {
    const posts = await request<SitemapPost[]>(
      apiUrl("posts", "?per_page=100&_fields=slug,modified"),
    );
    return { status: "success", data: posts };
  } catch (error) {
    console.error("Could not load posts for the sitemap:", error);
    return { status: "error", message: "The sitemap could not load articles." };
  }
}

export function featuredImage(post: WordPressPost) {
  const image = post._embedded?.["wp:featuredmedia"]?.[0];
  return image
    ? {
        src: image.media_details?.sizes?.large?.source_url ?? image.source_url,
        alt: image.alt_text || plainText(post.title.rendered),
      }
    : null;
}

export function plainText(html: string) {
  return html
    .replace(/<[^>]*>/g, " ")
    .replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/&#8217;|&rsquo;/g, "’")
    .replace(/&#8216;|&lsquo;/g, "‘")
    .replace(/&#8220;|&ldquo;/g, "“")
    .replace(/&#8221;|&rdquo;/g, "”")
    .replace(/\s+/g, " ")
    .trim();
}

function metaContent(head: string, key: string) {
  const escaped = key.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  const patterns = [
    new RegExp(`<meta[^>]+(?:property|name)=["']${escaped}["'][^>]+content=["']([^"']*)["']`, "i"),
    new RegExp(`<meta[^>]+content=["']([^"']*)["'][^>]+(?:property|name)=["']${escaped}["']`, "i"),
  ];
  return patterns.map((pattern) => head.match(pattern)?.[1]).find(Boolean);
}

export function publicSiteUrl() {
  return (process.env.SITE_URL || "https://horizoncruise.co.uk").replace(/\/$/, "");
}

export function publicArticleUrl(post: Pick<WordPressPost, "slug">) {
  return `${publicSiteUrl()}/articles/${encodeURIComponent(post.slug)}`;
}

export function isPublicSiteIndexable() {
  // Vercel previews must stay out of search even after the production launch.
  const isProduction = !process.env.VERCEL_ENV || process.env.VERCEL_ENV === "production";
  return process.env.SITE_INDEXABLE === "true" && isProduction;
}

async function rankMathHead(post: WordPressPost) {
  if (post.aioseo_head_json || post.yoast_head_json || !process.env.WORDPRESS_API_URL) {
    return null;
  }

  try {
    const root = process.env.WORDPRESS_API_URL.replace(/\/wp-json\/wp\/v2\/?$/, "");
    const response = await fetch(
      `${root}/wp-json/rankmath/v1/getHead?url=${encodeURIComponent(post.link)}`,
      { next: { revalidate: REVALIDATE_SECONDS } },
    );
    if (!response.ok) return null;
    const data = (await response.json()) as { head?: string };
    return data.head ?? null;
  } catch {
    return null;
  }
}

// SEO values come from the active WordPress plugin, never from duplicated copy.
export async function metadataForPost(post: WordPressPost): Promise<Metadata> {
  const aioseo = post.aioseo_head_json;
  const aioseoHead = post.aioseo_head ?? "";
  const yoast = post.yoast_head_json;
  const rankMath = await rankMathHead(post);
  const title =
    aioseo?.title ??
    metaContent(aioseoHead, "og:title") ??
    yoast?.title ??
    (rankMath && metaContent(rankMath, "og:title"));
  const description =
    aioseo?.description ??
    metaContent(aioseoHead, "description") ??
    yoast?.description ??
    (rankMath && metaContent(rankMath, "description"));
  // The CMS plugin supplies the SEO content; the public frontend owns its URLs.
  const canonical = publicArticleUrl(post);
  const ogImage =
    aioseo?.og_image ??
    metaContent(aioseoHead, "og:image") ??
    yoast?.og_image?.[0]?.url ??
    (rankMath && metaContent(rankMath, "og:image"));
  const twitterImage =
    aioseo?.twitter_image ?? metaContent(aioseoHead, "twitter:image") ?? ogImage;

  return {
    title: title || undefined,
    description: description || undefined,
    alternates: { canonical },
    robots: isPublicSiteIndexable()
      ? { index: true, follow: true, googleBot: { index: true, follow: true } }
      : { index: false, follow: false },
    openGraph: {
      title:
        aioseo?.og_title ?? metaContent(aioseoHead, "og:title") ?? yoast?.og_title ?? title ?? undefined,
      description:
        aioseo?.og_description ??
        metaContent(aioseoHead, "og:description") ??
        yoast?.og_description ??
        description ??
        undefined,
      url: canonical,
      type: "article",
      publishedTime: post.date,
      modifiedTime: post.modified,
      images: ogImage ? [{ url: ogImage }] : undefined,
    },
    twitter: {
      card: twitterImage ? "summary_large_image" : "summary",
      title:
        aioseo?.twitter_title ?? metaContent(aioseoHead, "twitter:title") ?? title ?? undefined,
      description:
        aioseo?.twitter_description ??
        metaContent(aioseoHead, "twitter:description") ??
        description ??
        undefined,
      images: twitterImage ? [twitterImage] : undefined,
    },
  };
}

function rewriteSchemaUrls(value: unknown, post: WordPressPost): unknown {
  if (Array.isArray(value)) return value.map((item) => rewriteSchemaUrls(item, post));

  if (value && typeof value === "object") {
    return Object.fromEntries(
      Object.entries(value).map(([key, item]) => [key, rewriteSchemaUrls(item, post)]),
    );
  }

  if (typeof value !== "string" || !value.startsWith("http")) return value;

  try {
    const url = new URL(value);
    const cms = new URL(post.link);
    if (url.origin !== cms.origin || url.pathname.startsWith("/wp-content/")) return value;

    const publicUrl = new URL(publicSiteUrl());
    if (url.pathname === cms.pathname) publicUrl.pathname = `/articles/${post.slug}`;
    else if (url.pathname.startsWith("/category/")) publicUrl.pathname = "/articles";
    else if (url.pathname.startsWith("/author/")) publicUrl.pathname = "/about";
    else publicUrl.pathname = url.pathname;
    publicUrl.hash = url.hash;
    return publicUrl.toString();
  } catch {
    return value;
  }
}

// Schema content comes from AIOSEO, while its CMS page URLs become public URLs.
export async function schemaForPost(post: WordPressPost) {
  if (post.aioseo_head_json?.schema) {
    return JSON.stringify(rewriteSchemaUrls(post.aioseo_head_json.schema, post));
  }

  if (post.yoast_head_json?.schema) {
    return JSON.stringify(rewriteSchemaUrls(post.yoast_head_json.schema, post));
  }

  const rankMath = await rankMathHead(post);
  return (
    rankMath?.match(
      /<script[^>]+type=["']application\/ld\+json["'][^>]*>([\s\S]*?)<\/script>/i,
    )?.[1]?.trim() ?? null
  );
}
