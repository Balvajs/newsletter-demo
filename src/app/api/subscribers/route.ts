import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '.././../../lib/prisma';
import { z } from 'zod';

const subscriberSchema = z.object({
  email: z.email('Please enter a valid email address'),
  name: z.string().optional(),
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const validatedData = subscriberSchema.parse(body);

    // Check if subscriber already exists
    const existingSubscriber = await prisma.subscriber.findUnique({
      where: { email: validatedData.email },
    });

    if (existingSubscriber) {
      if (existingSubscriber.isActive) {
        return NextResponse.json(
          { error: 'You are already subscribed to the newsletter' },
          { status: 400 }
        );
      } else {
        // Reactivate existing subscriber
        const subscriber = await prisma.subscriber.update({
          where: { email: validatedData.email },
          data: {
            isActive: true,
            name: validatedData.name || existingSubscriber.name,
          },
        });

        return NextResponse.json({
          message: 'Successfully resubscribed to the newsletter!',
          subscriber: {
            id: subscriber.id,
            email: subscriber.email,
            name: subscriber.name,
          },
        });
      }
    }

    // Create new subscriber
    const subscriber = await prisma.subscriber.create({
      data: {
        email: validatedData.email,
        name: validatedData.name,
        isActive: true,
      },
    });

    return NextResponse.json(
      {
        message: 'Successfully subscribed to the newsletter!',
        subscriber: {
          id: subscriber.id,
          email: subscriber.email,
          name: subscriber.name,
        },
      },
      { status: 201 }
    );
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Validation failed', details: error.issues },
        { status: 400 }
      );
    }

    console.error('Error creating subscriber:', error);
    return NextResponse.json(
      { error: 'Failed to subscribe. Please try again.' },
      { status: 500 }
    );
  }
}

export async function GET() {
  try {
    const subscribers = await prisma.subscriber.findMany({
      where: { isActive: true },
      select: {
        id: true,
        email: true,
        name: true,
        subscribedAt: true,
      },
      orderBy: { subscribedAt: 'desc' },
    });

    return NextResponse.json({
      subscribers,
      total: subscribers.length,
    });
  } catch (error) {
    console.error('Error fetching subscribers:', error);
    return NextResponse.json(
      { error: 'Failed to fetch subscribers' },
      { status: 500 }
    );
  }
}
