# Dev Feeds

Dev Feeds is a modern, open-source RSS/Atom feed management platform designed for developers and technical content creators. It allo
ws users to manage, aggregate, and distribute feeds through a powerful dashboard and a developer-friendly API. Built with Next.js, TypeScript, and Prisma, Dev Feeds integrates authentication, API key management, and robust access control to ensure a secure and intuitive user experience.

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
   - `NEXT_PUBLIC_SITE_URL`: Your site's public URL (e.g., `https://yourdomain.com`). This is used for generating sitemaps, Open Graph tags, and canonical URLs. If not set, defaults to `http://localhost:3000`.

3. **Run with Docker (recommended):**
   ```sh
   docker-compose up --build
   ```
   The app will be available at [http://localhost:3000](http://localhost:3000).

4. **Manual Development Setup:**  
   Install dependencies with `npm install`, set required env vars, then run:
   ```sh
   npm run dev
   ```

## API Overview

- **Authentication:** All API requests require a valid API key.
- **Endpoints:**
    - `/api/api-key`: Regenerate and retrieve the current user's API key (via POST).
    - Additional endpoints for feeds and posts management are available via the developer documentation.
- **Usage:**  
  Send your API key as a Bearer token or through designated headers for secure access.

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


