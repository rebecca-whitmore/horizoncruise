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

export type WordPressPost = {
  id: number;
  slug: string;
  date: string;
  link: string;
  title: RenderedText;
  excerpt: RenderedText;
  content: RenderedText;
  yoast_head_json?: YoastData;
  _embedded?: {
    "wp:featuredmedia"?: Array<{
      source_url?: string;
      alt_text?: string;
      media_details?: { sizes?: { large?: { source_url?: string } } };
    }>;
  };
};

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

function canonicalFromHead(head: string) {
  return head.match(/<link[^>]+rel=["']canonical["'][^>]+href=["']([^"']+)["']/i)?.[1];
}

async function rankMathHead(post: WordPressPost) {
  if (post.yoast_head_json || !process.env.WORDPRESS_API_URL) return null;

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
  const yoast = post.yoast_head_json;
  const rankMath = await rankMathHead(post);
  const title = yoast?.title ?? (rankMath && metaContent(rankMath, "og:title"));
  const description =
    yoast?.description ?? (rankMath && metaContent(rankMath, "description"));
  const canonical = yoast?.canonical ?? (rankMath && canonicalFromHead(rankMath));
  const ogImage =
    yoast?.og_image?.[0]?.url ?? (rankMath && metaContent(rankMath, "og:image"));

  return {
    title: title || undefined,
    description: description || undefined,
    alternates: canonical ? { canonical } : undefined,
    openGraph: {
      title: yoast?.og_title ?? title ?? undefined,
      description: yoast?.og_description ?? description ?? undefined,
      url: yoast?.og_url ?? canonical ?? undefined,
      type: "article",
      publishedTime: post.date,
      images: ogImage ? [{ url: ogImage }] : undefined,
    },
  };
}

// Yoast exposes schema as JSON; Rank Math includes the same JSON-LD in its head response.
export async function schemaForPost(post: WordPressPost) {
  if (post.yoast_head_json?.schema) {
    return JSON.stringify(post.yoast_head_json.schema);
  }

  const rankMath = await rankMathHead(post);
  return (
    rankMath?.match(
      /<script[^>]+type=["']application\/ld\+json["'][^>]*>([\s\S]*?)<\/script>/i,
    )?.[1]?.trim() ?? null
  );
}
