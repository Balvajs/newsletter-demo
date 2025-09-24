import Link from 'next/link';

export default function NotFound() {
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="text-center">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">
          Post not found
        </h2>
        <Link href="/admin/posts" className="text-blue-600 hover:text-blue-500">
          Back to posts
        </Link>
      </div>
    </div>
  );
}
