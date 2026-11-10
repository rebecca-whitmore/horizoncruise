import Link from "next/link";
import { SiteHeader } from "@/app/layout";
import { featuredImage, getPosts, plainText } from "@/lib/wordpress";

export const revalidate = 60;

const dateFormatter = new Intl.DateTimeFormat("en-GB", {
  day: "numeric",
  month: "long",
  year: "numeric",
});

export default async function ArticlesPage() {
  const result = await getPosts();

  return (
    <>
      <SiteHeader />
      <main className="page shell">
        <p className="eyebrow">Journal</p>
        <h1 className="page-title">Articles</h1>
        <hr className="rule" />

        {result.status === "error" ? (
          <p className="notice">{result.message} Please try again shortly.</p>
        ) : result.data.length === 0 ? (
          <p className="notice">No articles have been published yet.</p>
        ) : (
          <div className="article-grid">
            {result.data.map((post) => {
              const image = featuredImage(post);
              return (
                <Link className="card" href={`/articles/${post.slug}`} key={post.id}>
                  {image?.src ? (
                    // A native image keeps the first version dependency-free while supporting any CMS host.
                    // eslint-disable-next-line @next/next/no-img-element
                    <img className="card-image" src={image.src} alt={image.alt} />
                  ) : (
                    <div className="image-fallback" aria-hidden="true" />
                  )}
                  <p className="card-meta">{dateFormatter.format(new Date(post.date))}</p>
                  <h2 dangerouslySetInnerHTML={{ __html: post.title.rendered }} />
                  {post.excerpt.rendered && <p>{plainText(post.excerpt.rendered)}</p>}
                </Link>
              );
            })}
          </div>
        )}
      </main>
    </>
  );
}
