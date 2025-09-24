import { notFound } from 'next/navigation';
import { prisma } from '../../../lib/prisma';
import Link from 'next/link';

async function getPost(id: string) {
  try {
    const post = await prisma.post.findUnique({
      where: {
        id,
        status: 'PUBLISHED',
        publishedAt: {
          lte: new Date(),
        },
      },
    });

    return post;
  } catch (error) {
    console.error('Error fetching post:', error);
    return null;
  }
}

export default async function PostPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const resolvedParams = await params;
  const post = await getPost(resolvedParams.id);

  if (!post) {
    notFound();
  }

  const formatDate = (date: Date | null) => {
    if (!date) return '';
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  return (
    <div className="min-h-screen bg-white">
      <header className="bg-gray-900 text-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <Link
            href="/"
            className="inline-flex items-center text-gray-300 hover:text-white mb-4"
          >
            ← Back to all posts
          </Link>
          <h1 className="text-4xl font-bold">{post.title}</h1>
          <p className="text-gray-300 mt-2">
            Published on {formatDate(post.publishedAt || post.createdAt)}
          </p>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <article className="prose prose-lg max-w-none">
          <div className="whitespace-pre-wrap text-gray-900 leading-relaxed">
            {post.content}
          </div>
        </article>

        <div className="mt-12 pt-8 border-t border-gray-200">
          <div className="flex justify-between items-center">
            <Link
              href="/"
              className="text-blue-600 hover:text-blue-500 font-medium"
            >
              ← Back to all posts
            </Link>

            <div className="text-center">
              <p className="text-gray-600 mb-4">Enjoyed this post?</p>
              <Link
                href="/subscribe"
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
              >
                Subscribe to Newsletter
              </Link>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
