import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '../../../lib/prisma';
import { z } from 'zod';
import { scheduleEmailQueue } from '../../../lib/email-queue';
import { schedulePost } from '../../../lib/publish-post-queue';

// Helper function to generate slug from title
function generateSlug(title: string): string {
  return title
    .toLowerCase()
    .replace(/[^a-z0-9 -]/g, '') // Remove special characters
    .replace(/\s+/g, '-') // Replace spaces with hyphens
    .replace(/-+/g, '-') // Replace multiple hyphens with single hyphen
    .trim();
}

const commonPostSchema = {
  title: z.string().min(1, 'Title is required'),
  content: z.string().min(1, 'Content is required'),
  excerpt: z.string().optional(),
};

export const createPostSchema = z.discriminatedUnion('status', [
  z.object({
    ...commonPostSchema,
    status: z.literal('DRAFT'),
  }),
  z.object({
    ...commonPostSchema,
    status: z.literal('PUBLISHED'),
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
]);

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const validatedData = createPostSchema.parse(body);

    const post = await prisma.post.create({
      data: {
        title: validatedData.title,
        content: validatedData.content,
        excerpt:
          validatedData.excerpt || validatedData.content.substring(0, 200),
        slug: generateSlug(validatedData.title),
        publishedAt: validatedData.status === 'PUBLISHED' ? new Date() : null,
        scheduledFor:
          validatedData.status === 'SCHEDULED'
            ? validatedData.scheduledFor
            : null,
        status: validatedData.status,
      },
    }); // Handle immediate publishing with email
    if (validatedData.status === 'PUBLISHED') {
      await scheduleEmailQueue(post);
    }

    // Handle scheduling
    if (validatedData.status === 'SCHEDULED') {
      await schedulePost(post.id, validatedData.scheduledFor);
    }

    return NextResponse.json(post, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Validation failed', details: error.issues },
        { status: 400 }
      );
    }

    console.error('Error creating post:', error);
    return NextResponse.json(
      { error: 'Failed to create post' },
      { status: 500 }
    );
  }
}
