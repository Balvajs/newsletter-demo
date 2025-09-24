# Newsletter Application

A full-stack newsletter application built with Next.js, TypeScript, Prisma, and PostgreSQL. This
application allows users to author posts, schedule publications, manage subscribers, and send
automated newsletter emails.

## 🚦 Getting Started

### Prerequisites

- Node.js 24
- Docker (for Redis container)
- PNPM package manager

### Installation

1. **Clone the repository**

   ```bash
   git clone <repository-url>
   cd newsletter-demo
   ```

1. **Use right Node.js version**

   ```bash
   nvm use
   ```

1. **Install dependencies**

   ```bash
   pnpm install
   ```

1. **Start PostgreSQL** (in a separate terminal)

   ```bash
   pnpm db:dev
   ```

1. **Run migrations**

   ```bash
   pnpm db:migrate
   ```

1. **Set up environment variables**

   ```bash
   cp .env.example .env
   ```

   Configure the following variables in `.env`:

   ```env
   DATABASE_URL="prisma+postgres://localhost:{YOUR_PORT}/?api_key={YOUR_KEY}" # you can get the url from running `pnpm db:dev`
   ```

1. **Start Redis server**

   ```bash
   pnpm start-redis
   ```

1. **Start the background job worker** (in a separate terminal)

   ```bash
   pnpm worker
   ```

1. **Start the development server**

   ```bash
   pnpm dev
   ```

The application will be available at `http://localhost:3000`.

## 📖 Usage

### Creating Posts

1. Navigate to `/admin/posts` to access the admin interface
2. Click "New Post" to create a new post
3. Fill in the title, content, and excerpt
4. Choose to save as draft, publish immediately, or schedule for later
5. Scheduled posts will be automatically published at the specified time

### Managing Subscribers

1. Users can subscribe at `/subscribe`
2. View subscriber list via the API at `/api/subscribers`
3. Subscribers automatically receive emails when posts are published

### Scheduled Publishing

- Posts can be scheduled for future publication
- The Bull queue system handles job scheduling and execution
- Email notifications are automatically sent to subscribers upon publication

## 🏗 Technical Architecture

### Why This Technology Stack?

**Next.js**

- It provides everything needed for this task out of the box

**Prisma as ORM**

- I have experience with Prisma from long ago and I wanted to see how is it now compared with
  Drizzle I used recently

**Bull with Redis**

- Easy setup of scheduling and processing with retries
- Redis provides fast in-memory operations for queue management

**Tailwind CSS**

- Easy to use
- Consistent design system
- Popular in the industry
- Smaller bundle sizes compared to component libraries

### Trade-offs Made

**Email Service Implementation**

- **Decision**: Implemented mock email service instead of real integration
- **Why**: Choosing and setting up an email service would take too long
- **Trade-off**: Requires integration work for production deployment

**Job Processing**

- **Decision**: Separate worker process for job handling
- **Why**: Keeps web server responsive and allows for independent scaling
- **Trade-off**: Additional infrastructure complexity

**Email failure handling**

- **Decision**: Ignore failed email submissions
- **Why**: The solution can change depending on the email service chosen
- **Trade-off**: Failed emails (after 5 retries) won't be sent ever again

**Loading and error handling in the UI**

- **Decision**: Skip adding loading skeletons and sophisticated error handling for MVP
- **Why**: The main concern was to have the functions done
- **Trade-off**: Worse UX

**Posts pagination**

- **Decision**: Always fetch all posts available
- **Why**: We are starting our newsletter web and we have only small amount of posts
- **Trade-off**: Will stop scaling soon, once we have bigger amount of posts

## Production Deployment

I would go with Cloudflare Workers to host the Next.js app and use their queue instead of Redis. I
simply have good experience with Cloudflare and I find the developer experience great + the pricing
is not bad. The database would be hosted on Prisma, where else?

## Future Improvements

### Short-term (1-2 weeks)

- **Email service**: Integrate with a service like SendGrid or Postmark
- **Failed emails handling**: Implement robust error handling and retry logic for failed emails
- **Pagination**: Implement pagination for post listings
- **Authentication system**: Implement admin authentication
- **Subscriber management**: Unsubscribe functionality and preferences

### Medium-term (1-2 months)

- **Analytics**: Open rates, click tracking, and subscriber metrics
- **Email segmentation**: Targeted emails based on subscriber preferences
- **API rate limiting**: Protect against abuse and ensure fair usage
- **API type safety**: Implement type safety for API routes and requests, using for example tRPC or
  at least shared Zod schemas
