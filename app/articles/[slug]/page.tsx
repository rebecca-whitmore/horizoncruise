import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { SiteHeader } from "@/app/layout";
import {
  featuredImage,
  getPostBySlug,
  metadataForPost,
  schemaForPost,
} from "@/lib/wordpress";

export const revalidate = 60;

type PageProps = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const result = await getPostBySlug(slug);
  if (result.status === "error" || !result.data) return {};
  return metadataForPost(result.data);
}

export default async function ArticlePage({ params }: PageProps) {
  const { slug } = await params;
  const result = await getPostBySlug(slug);

  if (result.status === "error") {
    return (
      <>
        <SiteHeader />
        <main className="page shell"><p className="notice">{result.message} Please try again shortly.</p></main>
      </>
    );
  }

  if (!result.data) notFound();

  const post = result.data;
  const image = featuredImage(post);
  const schema = await schemaForPost(post);

  return (
    <>
      <SiteHeader />
      <main className="page shell">
        {schema && (
          <script
            type="application/ld+json"
            dangerouslySetInnerHTML={{ __html: schema }}
          />
        )}
        <header className="article-header">
          <p className="eyebrow">Article</p>
          <h1 className="page-title" dangerouslySetInnerHTML={{ __html: post.title.rendered }} />
        </header>
        {image?.src && (
          // eslint-disable-next-line @next/next/no-img-element
          <img className="article-hero" src={image.src} alt={image.alt} />
        )}
        <article
          className="article-body"
          dangerouslySetInnerHTML={{ __html: post.content.rendered }}
        />
      </main>
    </>
  );
}
