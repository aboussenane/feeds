# Dev Feeds

A developer-friendly social media platform for creating and hosting feeds with text, image, and video posts.

## Features

- 🔐 User authentication with Supabase
- 📝 Create feeds with custom titles and descriptions
- 🖼️ Add posts with text, images, or videos
- 🔗 Shareable feed links
- 🔑 API key access for programmatic posting
- 👤 Profile settings with API documentation
- 🎨 Simple, clean interface

## Getting Started

### Prerequisites

- Node.js 20+ 
- npm or yarn
- Supabase account and project

### Installation

1. Install dependencies:
```bash
npm install
```

2. Set up environment variables:
Create a `.env.local` file with:
```bash
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
DATABASE_URL=your_supabase_postgres_connection_string
```

3. Set up the database:
```bash
npm run db:push
```

4. Generate Prisma client:
```bash
npm run db:generate
```

5. Set up Supabase Storage:
   - Go to your Supabase dashboard → Storage
   - Create a new bucket named `feed-uploads`
   - Make it **public** (enable public access)
   - See `SUPABASE_STORAGE_SETUP.md` for detailed instructions

6. Run the development server:
```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## Docker Deployment

To run the application in Docker:

1. **Create a `.env` file** (copy from `.env.example` and fill in your values)

2. **Build and run with Docker Compose**:
```bash
docker-compose up -d
```

3. **Access the application** at http://localhost:3000

See [DOCKER.md](./DOCKER.md) for detailed Docker setup instructions.

## Project Structure

- `app/` - Next.js app router pages and API routes
- `components/` - React components
- `lib/` - Utility functions, Prisma client, and Supabase clients
- `prisma/` - Database schema
- `context/` - React context providers (auth)

**Note**: 
- Files ≤50MB are stored in Supabase Storage
- Files >50MB are stored locally in `public/uploads/` (organized by user ID)

## Usage

1. **Sign Up/Login**: Create an account or login
2. **Create a Feed**: Click "Create New Feed" on the home page
3. **Add Posts**: Open your feed and click "Add Post" to create text, image, or video posts
4. **Share**: Use the share button to copy or share your feed link
5. **API Access**: Visit your profile page to get your API key and documentation

## API Usage

### Creating Posts via API

```bash
curl -X POST http://localhost:3000/api/posts \
  -H "Authorization: Bearer YOUR_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "feedId": "your-feed-id",
    "type": "text",
    "content": "Hello from API!"
  }'
```

### Creating Feeds via API

```bash
curl -X POST http://localhost:3000/api/feeds \
  -H "Authorization: Bearer YOUR_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "title": "My Feed",
    "description": "A cool feed"
  }'
```

## Tech Stack

- Next.js 15
- TypeScript
- Supabase (Auth & Database)
- Prisma (PostgreSQL)
- Tailwind CSS
- shadcn/ui components

