# Dev Feeds

Dev Feeds is a modern, open-source RSS/Atom feed management platform designed for developers and technical content creators. It allows users to manage, aggregate, and distribute feeds through a powerful dashboard and a developer-friendly API. Built with Next.js, TypeScript, and Prisma, Dev Feeds integrates authentication, API key management, and robust access control to ensure a secure and intuitive user experience.

## Showcase

See a live example feed (local dev):

**[My Awesome Feed](http://localhost:3000/feeds/27044d19-2aa5-4926-92c7-000725522b5b/my-awesome-feed)**

- Web: `/feeds/{username-or-id}/{slug}`
- RSS: `/feeds/{username-or-id}/{slug}/rss`
- JSON Feed: `/feeds/{username-or-id}/{slug}/json`

## Built for developers

Feeds is designed around workflows developers already use: HTTP, curl, API keys, and standard syndication formats. You can run everything from a browser, a shell script, or a CI job without touching the UI.

### Developer-friendly

- **REST API** — Create feeds, publish posts, upload media, and manage styles with predictable JSON endpoints.
- **Bearer token auth** — One API key per user (from your profile). Pass it as `Authorization: Bearer <key>`; no OAuth dance for automation.
- **Standard output formats** — Every public feed exposes RSS and [JSON Feed](https://www.jsonfeed.org/) URLs alongside the HTML page, so readers and tools can subscribe without custom integration.
- **Self-documenting** — `GET /api/info` returns API metadata; full endpoint docs live at `/docs`.
- **Typed stack** — Next.js App Router, TypeScript, and Prisma make the codebase easy to extend and deploy.

### Ease of access

- **Fast onboarding** — Sign in with email, copy your API key from the profile page, and make your first `curl` request in minutes.
- **Stable public URLs** — Feeds live at `/feeds/{username}/{slug}` (or `/feeds/{userId}/{slug}` before you set a username). Share one link for humans; append `/rss` or `/json` for machines.
- **Public read, authenticated write** — Anyone can subscribe to or scrape a public feed; only you need a key to publish.
- **Local or Docker** — `npm run dev` or `docker-compose up` gets you running with minimal setup.

### Automatable

- **Scriptable publishing** — Pipe build logs, release notes, or changelog entries into feeds from GitHub Actions, cron, or any HTTP client.
- **Bulk operations** — List feeds (`GET /api/feeds`), create feeds (`POST /api/feeds`), add posts (`POST /api/posts`), and upload assets (`POST /api/upload`) without manual clicks.
- **Included test harness** — `test-api.sh` and `test-api.js` exercise the API for smoke testing after deploy or during development.

Example: create a feed from the command line:

```sh
curl -X POST http://localhost:3000/api/feeds \
  -H "Authorization: Bearer YOUR_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{"title": "My Awesome Feed", "description": "Shipped from curl"}'
```

## Features

- **User Authentication**: Secure user login and registration via Supabase.
- **Profile Management**: Update account details, manage API keys, and configure user preferences.
- **API Key Management**: Easily generate, copy, and regenerate API keys to access the Dev Feeds API.
- **Feed Creation and Management**: Create, edit, and manage multiple custom feeds.
- **Post Aggregation**: Add posts to feeds for aggregation and distribution.
- **Developer API**: Programmatic access to user feeds and posts via authenticated endpoints.
- **Docker Support**: Ready-to-use `docker-compose.yml` for local or production deployment.
- **Responsive UI**: Clean and modern UI built with shadcn/ui components and TailwindCSS.
- **Error Handling and Health Checks**: Robust error handling in API endpoints and integrated Docker health checks.

## How It Works

1. **Sign Up / Sign In:**
   - Authenticate using your email with Supabase.
2. **Profile Dashboard:**
   - Manage your personal information and view your unique API key for accessing the developer API.
   - Regenerate your key at any time—old keys are immediately invalidated for improved security.
3. **Manage Feeds:**
   - Create and organize custom feeds.
   - Add, edit, or remove posts within your feeds.
4. **API Access:**
   - Use your API key to interact programmatically with the Dev Feeds backend.
   - Secure endpoints verify API key validity and usage timestamps.
5. **Deployment:**
   - Easily deploy locally or to production using Docker. Environment variables and health checks make configuration simple and reliable.

## Technologies Used

- **Next.js (App Router)** – frontend and API routes
- **TypeScript** – static typing for safer code
- **Prisma** – ORM for database access
- **Supabase** – authentication and user management
- **PostgreSQL** – primary data storage
- **shadcn/ui** – reusable, styled React components
- **Docker** – containerization and deployment
- **Lucide Icons** – rich, scalable icons for enhanced UI/UX

## Getting Started

1. **Clone the repository:**
   ```sh
   git clone https://github.com/your-org/dev-feeds.git
   cd dev-feeds
   ```

2. **Set up environment variables:**  
   Copy `.env.example` to `.env` and supply the appropriate values for Supabase and your database.
   
   **Required for SEO:**
   - `NEXT_PUBLIC_SITE_URL`: Your site's public URL (e.g., `https://feeds-pink.vercel.app/`). This is used for generating sitemaps, Open Graph tags, and canonical URLs. If not set, defaults to `https://feeds-pink.vercel.app`.

3. **Run with Docker (recommended):**
   ```sh
   docker-compose up --build
   ```
       The app will be available at [https://feeds-pink.vercel.app](https://feeds-pink.vercel.app).

4. **Manual Development Setup:**  
   Install dependencies with `npm install`, set required env vars, then run:
   ```sh
   npm run dev
   ```

## API Overview

- **Authentication:** All write API requests require a valid API key (`Authorization: Bearer <key>`).
- **Endpoints:**
    - `GET /api/feeds` — List your feeds and posts
    - `POST /api/feeds` — Create a feed
    - `POST /api/posts` — Publish to a feed
    - `POST /api/upload` — Upload media for posts
    - `POST /api/api-key` — Regenerate your API key
    - `GET /api/info` — API metadata and feed format paths
- **Public syndication** (no auth):
    - `GET /feeds/[username]/[feedTitle]/rss`
    - `GET /feeds/[username]/[feedTitle]/json`
- **Documentation:** See `/docs` on a running instance for request/response examples.

## SEO Optimization

The application includes comprehensive SEO optimizations:

- **Meta Tags**: Enhanced metadata with Open Graph and Twitter Card support
- **Dynamic Metadata**: Feed pages automatically generate SEO-friendly metadata based on content
- **Structured Data**: JSON-LD schema markup for Blog and BlogPosting types
- **Sitemap**: Dynamic sitemap generation at `/sitemap.xml` (includes all public feeds)
- **Robots.txt**: Configured at `/robots.txt` to guide search engine crawlers
- **Semantic HTML**: Proper use of `<article>`, `<section>`, and `<time>` tags
- **Canonical URLs**: Prevents duplicate content issues
- **Image Alt Text**: All images include descriptive alt attributes

**Note**: Set `NEXT_PUBLIC_SITE_URL` in your environment variables for production to ensure correct URLs in sitemaps and meta tags.

## Security

- API keys are unique per user; old keys are invalidated upon regeneration.
- Key usage updates last-used timestamps for monitoring and analytics.
- Sensitive endpoints require authentication and are protected against unauthorized access.

## Contributing

Contributions, bug reports, and feature requests are welcome! Please open an issue or pull request on GitHub.

---

**Dev Feeds** aims to streamline digital publishing workflows with a developer-first mindset. Whether you're syndicating your blog or building an RSS-powered service, Dev Feeds offers the reliability and APIs you need.


