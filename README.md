# Horizon Cruise

The public, headless Next.js front end for Horizon Cruise. Articles are written
in WordPress and fetched through its REST API.

## Local setup

1. Install dependencies with `npm install`.
2. Copy `.env.example` to `.env.local` and add the WordPress REST API URL.
3. Start the site with `npm run dev`.
4. Open `http://localhost:3000`.

The expected API URL format is `https://your-cms.example/wp-json/wp/v2` (without
a trailing slash). WordPress requests are refreshed every five minutes, so new
or updated articles appear without a manual deployment.

## Routes

- `/` — temporary public coming-soon page
- `/articles` — article index
- `/articles/[slug]` — individual article
- `/about` and `/contact` — placeholder pages for later development
