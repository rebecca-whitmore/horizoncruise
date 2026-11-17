# Horizon Cruise Architecture Audit

Audit date: 17 November 2026

This is an inspection-only assessment of the current repository. It distinguishes confirmed repository evidence from matters that require read-only verification against the live WordPress database.

## Confirmed findings

### 1. Frontend

- Next.js is pinned to **16.4.6** with React 19.3.1 in `package.json`.
- It uses the **App Router**: routes live under `app/`; there is no `pages/` router.
- The public root is still the static “Coming soon” page in `app/page.tsx`.
- About and Contact are empty placeholder pages. The future homepage is only available at `/home-preview`.
- The only WordPress-powered public templates currently implemented are:
  - `/articles`
  - `/articles/[slug]`
  - Article entries in `/sitemap.xml`

There are no Cruise Line, Ship, Ship Feature or Featured Journey frontend templates or WordPress-fetching functions yet.

WordPress behaviour:

- The shared fetch wrapper uses Next’s Data Cache with `revalidate: 60` in `lib/wordpress.ts`.
- `/articles` requests only the first 12 published posts and is configured for 60-second revalidation in `app/articles/page.tsx`.
- `/articles/[slug]` fetches by slug on demand. There is no `generateStaticParams`, so article slugs are not enumerated for build-time generation. The route is eligible for cached ISR-style rendering and 60-second revalidation.
- The sitemap fetches at most 100 posts and revalidates every 60 seconds in `app/sitemap.ts`.

### 2. Relationship filtering

The Horizon Cruise Content plugin does **not** currently register REST collection filters for:

- Ships by Cruise Line
- Ship Features by Ship
- Featured Journeys by Ship
- Featured Journeys by Cruise Line

There are no implementations of:

- `rest_ship_collection_params` / `rest_ship_query`
- `rest_ship_feature_collection_params` / `rest_ship_feature_query`
- `rest_featured_journey_collection_params` / `rest_featured_journey_query`

Therefore:

- No relationship filter parameters are registered.
- No parameter validation exists.
- No `meta_query`, Pods query or `wp_podsrel` query implementation exists.
- Pods exposing fields in REST responses does not make them queryable.

The plugin correctly registers the internal post types and separate REST bases in `wordpress/plugins/horizon-cruise-content/horizon-cruise-content.php`. Any WordPress REST query hooks must use `ship`, `ship_feature` and `featured_journey`, not `ships`, `ship-features` or `featured-journeys`.

### 3. Relationship storage

Confirmed:

- The export was produced by Pods **3.3.9.2** in `wordpress/releases/pods-package-2026-11-16.json`.
- All four Pods use `storage: meta`.
- Configured relationships are:
  - Ship → Cruise Line: single
  - Ship Feature → Ship: single
  - Featured Journey → Cruise Line: single
  - Featured Journey → Ships: multiple
- Their REST response setting is `id`; that controls serialization, not database storage.
- The importer saves relationships through Pods’ `add()` and `save()` methods and reads them through Pods field traversal in `wordpress/plugins/horizon-cruise-content/includes/class-horizon-cruise-csv-importer.php`.
- Permanent importer keys are ordinary private post metadata under `_horizon_cruise_import_key`.

Not confirmed:

- Whether each live relationship is represented in `postmeta`, the Pods relationship table, or both.
- Whether the site defines `PODS_TABLELESS` or applies Pods storage filters outside this repository.
- Whether the live table prefix is `wp_`.

Pods normally uses its relationship table for Relationship fields, while simple/tableless configurations can use metadata or compatibility metadata. Relevant references:

- [Pods database storage documentation](https://docs.pods.io/faqs/where-is-everything-stored-in-the-wordpress-database/)
- [Pods storage source](https://github.com/pods-framework/pods/blob/main/includes/general.php)

### 4. Pagination and resilience

- No WordPress collection fetch follows `X-WP-TotalPages` or `Link` headers.
- Articles stop at 12 posts.
- Sitemap articles stop at 100.
- No Horizon Cruise structured-content collection fetches exist yet.
- Requests are not paginated concurrently or sequentially because only one page is requested.
- There is no explicit request timeout or `AbortController`.
- Non-2xx responses and JSON failures are caught and returned as explicit error results in `lib/wordpress.ts`.
- The article index distinguishes API failure from a valid empty collection.
- A slug request distinguishes API failure from a successful empty response/404.
- The sitemap deliberately falls back to static URLs after an API failure rather than treating it as a genuinely empty article collection.

No current collection code mistakes a caught WordPress failure for an empty result. Rank Math SEO fallback failures are silently reduced to `null`, but that is SEO degradation rather than collection loss.

### 5. Content refresh

Existing refresh behaviour is entirely time-based:

- WordPress fetches: 60-second revalidation.
- Article routes: 60 seconds.
- Sitemap: 60 seconds.
- No webhook endpoint, cache tags, `revalidatePath`, `revalidateTag` or WordPress publishing hook exists.

For future structured pages, refresh handling must cover:

- Manual edits
- CSV imports
- Publishing and unpublishing
- Deletion
- Relationship changes

Relationship changes must invalidate both old and new parents:

- Ship Cruise Line change: old and new Cruise Line pages, Ship page and relevant collections.
- Ship Feature Ship change: old and new Ship pages.
- Journey Cruise Line change: old and new Cruise Line pages.
- Journey Ships change: every removed and added Ship page.
- Publishing, unpublishing and deletion: detail page, collections, sitemap and all related parent pages.

Deletion handling must capture relationships before the record is removed. Import-triggered relationship saves also need explicit coverage rather than assuming every Pods relationship write produces the same WordPress post hook sequence.

## Items requiring live verification

The smallest read-only storage check is:

1. Choose one known Ship, Ship Feature and Featured Journey ID.
2. Read the raw relevant post metadata without Pods display filtering.
3. Query the prefixed Pods relationship table for those item IDs and the exported relationship field IDs.
4. Compare those results with read-only Pods API traversal such as `pods(...)->field('ships.ID')`.

This can be done through authenticated WP-CLI or a database read-only session on the server. No credentials need to be shared in chat, and no settings need changing.

Also verify live that the three relationship dropdowns intended to accept drafts have been updated, because the latest export still limits some targets to `publish`.

## Changes needed before public templates or bulk content

1. Perform the small read-only relationship-storage check.
2. Add explicit, validated REST filters using the internal post-type hook names.
3. Base their query implementation on confirmed storage rather than assuming `meta_query`.
4. Add a reusable paginated WordPress collection fetcher that reads `X-WP-TotalPages`.
5. Add request timeouts and preserve explicit error-versus-empty results.
6. Build the actual Cruise Line, Ship and Featured Journey frontend routes.
7. Design on-demand revalidation with old/new relationship awareness before relying on immediate content updates.

## Improvements that can wait

- Parallel pagination once data volumes justify it.
- Cache tags finer than page-level invalidation.
- Retry/backoff for transient WordPress errors.
- Media optimization and richer loading states.
- Webhook implementation itself, until routes and filter contracts are settled.

## Smallest practical next step

Run the read-only live storage check for one single relationship and the Featured Journey’s multiple `ships` relationship. That evidence determines whether the REST filters should use post metadata, the Pods relationship table or Pods querying and avoids building the filtering layer on an unverified storage assumption.
