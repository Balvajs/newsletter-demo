import Link from 'next/link';
import { prisma } from '../lib/prisma';

export default async function HomePage() {
  const posts = await prisma.post.findMany({
    where: {
      status: 'PUBLISHED',
    },
    orderBy: { publishedAt: 'desc' },
    select: {
      id: true,
      title: true,
      excerpt: true,
      publishedAt: true,
    },
  });

  return (
    <div className="min-h-screen bg-white">
      <header className="bg-gray-900 text-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <h1 className="text-4xl font-bold mb-4">My Newsletter</h1>
          <p className="text-xl text-gray-300">
            Welcome to my personal newsletter. Subscribe to get updates
            delivered to your inbox.
          </p>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {posts.length === 0 ? (
          <div className="text-center py-12">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">
              No posts yet
            </h2>
            <p className="text-gray-600">
              Check back soon for new content, or subscribe to be notified when
              new posts are published.
            </p>
          </div>
        ) : (
          <div className="space-y-8">
            {posts.map(post => (
              <article key={post.id} className="border-b border-gray-200 pb-8">
                <h3 className="text-2xl font-bold text-gray-900 mb-2">
                  <Link
                    href={`/posts/${post.id}`}
                    className="hover:text-blue-600"
                  >
                    {post.title}
                  </Link>
                </h3>
                <p className="text-gray-700 mb-4">{post.excerpt}</p>
                <Link
                  href={`/posts/${post.id}`}
                  className="text-blue-600 hover:text-blue-500 font-medium"
                >
                  Read more →
                </Link>
              </article>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
