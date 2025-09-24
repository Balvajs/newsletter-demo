import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '../../../../lib/prisma';
import { z } from 'zod';
import { scheduleEmailQueue } from '../../../../lib/email-queue';
import { schedulePost } from '../../../../lib/publish-post-queue';

const commonPostSchema = {
  title: z.string().min(1),
  content: z.string().min(1),
  excerpt: z.string().optional(),
};

export const updatePostSchema = z.discriminatedUnion('status', [
  z.object({
    ...commonPostSchema,
    status: z.literal('DRAFT'),
  }),
  z.object({
    ...commonPostSchema,
    status: z.literal('SCHEDULED'),
    scheduledFor: z.iso
      .datetime()
      .transform(date => (typeof date === 'string' ? new Date(date) : date))
      .refine(date => !date || date > new Date(), {
        message: 'scheduledFor must be a future date',
      }),
  }),
  z.object({
    ...commonPostSchema,
    status: z.literal('PUBLISHED'),
  }),
]);

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    const validatedData = updatePostSchema.parse(body);

    const existingPost = await prisma.post.findUnique({
      where: { id },
    });

    if (!existingPost) {
      return NextResponse.json({ error: 'Post not found' }, { status: 404 });
    }

    if (
      (existingPost.status === 'PUBLISHED' ||
        existingPost.status === 'SCHEDULED') &&
      validatedData.status !== existingPost.status
    ) {
      return NextResponse.json(
        { error: 'Published or scheduled posts cannot be changed' },
        { status: 400 }
      );
    }

    const post = await prisma.post.update({
      where: { id },
      data: {
        ...validatedData,
        publishedAt:
          existingPost.status !== 'PUBLISHED' &&
          validatedData.status === 'PUBLISHED'
            ? new Date()
            : null,
      },
    });

    // if is newly published
    if (
      existingPost.status !== 'PUBLISHED' &&
      validatedData.status === 'PUBLISHED'
    ) {
      await scheduleEmailQueue(post);
    }

    // if is newly scheduled
    if (
      existingPost.status !== 'SCHEDULED' &&
      validatedData.status === 'SCHEDULED'
    ) {
      await schedulePost(post.id, validatedData.scheduledFor);
    }

    return NextResponse.json(post);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        {
          error: `Validation failed`,
          details: error.issues,
        },
        { status: 400 }
      );
    }

    console.error('Error updating post:', error);
    return NextResponse.json(
      { error: 'Failed to update post' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const existingPost = await prisma.post.findUnique({
      where: { id },
    });

    if (!existingPost) {
      return NextResponse.json({ error: 'Post not found' }, { status: 404 });
    }

    await prisma.post.delete({
      where: { id },
    });

    return NextResponse.json({ message: 'Post deleted successfully' });
  } catch (error) {
    console.error('Error deleting post:', error);
    return NextResponse.json(
      { error: 'Failed to delete post' },
      { status: 500 }
    );
  }
}
