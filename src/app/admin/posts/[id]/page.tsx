import { notFound } from 'next/navigation';
import EditPostForm from './form';
import { prisma } from '../../../../lib/prisma';

export default async function EditPostPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const post = await prisma.post.findUnique({
    where: { id },
  });

  if (!post) {
    notFound();
  }

  return <EditPostForm post={post} />;
}
